import { NextResponse } from "next/server";
import { auth, authEnabled } from "@/auth";
import { QUESTS } from "@/lib/content";
import { getSql } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/rate-limit";
import type { ProgressEventType } from "@/lib/db/db";
import type { SyncEvent } from "@/lib/sync-merge";

// The server trusts only validated events, never client-computed totals.
const KNOWN_QUEST_IDS = new Set(QUESTS.map((quest) => quest.id));
const KNOWN_TYPES: ProgressEventType[] = [
  "quest_started",
  "increment",
  "undo",
  "quest_completed",
];
const MAX_BATCH = 2000;
const MAX_AGE_MS = 366 * 86_400_000;
const CLOCK_SKEW_MS = 5 * 60_000;

function parseEvents(raw: unknown): SyncEvent[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_BATCH) return null;
  const events: SyncEvent[] = [];
  const now = Date.now();
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.id !== "string" || candidate.id.length === 0 || candidate.id.length > 64) {
      return null;
    }
    if (!KNOWN_TYPES.includes(candidate.type as ProgressEventType)) return null;
    if (typeof candidate.questId !== "string" || !KNOWN_QUEST_IDS.has(candidate.questId)) {
      return null;
    }
    if (candidate.delta !== -1 && candidate.delta !== 0 && candidate.delta !== 1) return null;
    if (
      typeof candidate.at !== "number" ||
      !Number.isFinite(candidate.at) ||
      candidate.at < now - MAX_AGE_MS ||
      candidate.at > now + CLOCK_SKEW_MS
    ) {
      return null;
    }
    events.push({
      id: candidate.id,
      // KNOWN_TYPES.includes above validates the value; the cast records it.
      type: candidate.type as ProgressEventType,
      questId: candidate.questId,
      delta: candidate.delta,
      at: candidate.at,
    });
  }
  return events;
}

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
  const events = parseEvents((body as { events?: unknown } | null)?.events);
  if (events === null) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (events.length > 0) {
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
export async function DELETE() {
  if (!authEnabled) {
    return NextResponse.json({ error: "sync_not_configured" }, { status: 503 });
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
