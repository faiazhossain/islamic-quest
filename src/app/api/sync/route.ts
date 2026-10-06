import { NextResponse } from "next/server";
import { auth, authEnabled } from "@/auth";
import { getSql } from "@/lib/server/db";
import { isSameOrigin } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { MAX_USER_EVENTS, parseEvents } from "@/lib/event-validation";

/** Sync capability probe used by the settings UI. */
export async function GET() {
  const session = authEnabled ? await auth() : null;
  const userKey = (session?.user as { userKey?: string } | undefined)?.userKey;
  return NextResponse.json({
    enabled: authEnabled,
    signedIn: Boolean(userKey),
    email: session?.user?.email ?? null,
  });
}

/** Pushes local events (idempotent by event uuid) and returns the authoritative snapshot. */
export async function POST(request: Request) {
  if (!authEnabled) {
    return NextResponse.json({ error: "sync_not_configured" }, { status: 503 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "origin_blocked" }, { status: 403 });
  }
  const session = await auth();
  const userKey = (session?.user as { userKey?: string } | undefined)?.userKey;
  if (!userKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!rateLimit(`sync:${userKey}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "sync_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const events = parseEvents((body as { events?: unknown } | null)?.events, Date.now());
  if (events === null) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (events.length > 0) {
    // Abuse cap: refuse batches that would push a user far past genuine
    // practice volume before a single row is written.
    const counted = await sql`
      SELECT count(*)::int AS count
      FROM progress_events
      WHERE user_key = ${userKey}
    `;
    const existing = Number(counted[0]?.count ?? 0);
    if (existing + events.length > MAX_USER_EVENTS) {
      return NextResponse.json({ error: "quota_exceeded" }, { status: 409 });
    }
    await sql`
      INSERT INTO progress_events ${sql(
        events.map((event) => ({
          id: event.id,
          user_key: userKey,
          type: event.type,
          quest_id: event.questId,
          delta: event.delta,
          at: event.at,
        })),
      )}
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const snapshot = await sql`
    SELECT id, type, quest_id AS "questId", delta, at
    FROM progress_events
    WHERE user_key = ${userKey}
    ORDER BY at ASC, id ASC
  `;

  return NextResponse.json({
    synced: events.map((event) => event.id),
    serverEvents: snapshot,
  });
}

/** Permanently deletes the signed-in user's server-side copy. */
export async function DELETE(request: Request) {
  if (!authEnabled) {
    return NextResponse.json({ error: "sync_not_configured" }, { status: 503 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "origin_blocked" }, { status: 403 });
  }
  const session = await auth();
  const userKey = (session?.user as { userKey?: string } | undefined)?.userKey;
  if (!userKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "sync_not_configured" }, { status: 503 });
  }
  await sql`DELETE FROM progress_events WHERE user_key = ${userKey}`;
  return NextResponse.json({ deleted: true });
}
