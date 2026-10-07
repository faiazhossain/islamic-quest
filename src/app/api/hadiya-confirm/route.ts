import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

/**
 * Notification ping for a confirmed Hadiya ("I've sent a Hadiya" on the
 * Support page). The Discord webhook URL is a secret - anyone holding it
 * can post to the channel - so it lives in an environment variable and
 * never reaches the client bundle; the browser only calls this
 * same-origin route, which forwards a minimal note with no personal
 * data: region, optional channel hint, timestamp. Deliver is best-effort
 * on purpose: the gift itself already happened outside the app, so a
 * missed webhook must never read as a failed gift to the giver.
 */

const CHANNELS = new Set(["bkash", "ebl"]);
const REGIONS = new Set(["bd", "intl"]);
/** A valid body is a tiny two-field JSON object; anything larger is junk. */
const MAX_BODY_BYTES = 512;
/** Per-IP fixed window; the webhook is the abuse surface being protected. */
const LIMIT_PER_HOUR = 5;

function json(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("cache-control", "no-store");
  return response;
}

const regionLabel = (region: string | null): string =>
  region === "bd" ? "Inside Bangladesh" : region === "intl" ? "Outside Bangladesh" : "Unspecified";

const channelLabel = (channel: string | null): string =>
  channel === "bkash" ? "bKash" : channel === "ebl" ? "EBL Visa" : "Unspecified";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ error: "origin_blocked" }, { status: 403 });
  }
  // x-forwarded-for is spoofable, so this throttles casual spam rather
  // than defending against a determined adversary; Discord applies its
  // own rate limits behind this.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`hadiya:${ip}`, LIMIT_PER_HOUR, 3_600_000)) {
    return json({ error: "rate_limited" }, { status: 429 });
  }

  let parsed: { channel?: unknown; region?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: "invalid_body" }, { status: 400 });
    }
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_body" }, { status: 400 });
  }
  const channel =
    typeof parsed.channel === "string" && CHANNELS.has(parsed.channel)
      ? parsed.channel
      : null;
  const region =
    typeof parsed.region === "string" && REGIONS.has(parsed.region)
      ? parsed.region
      : null;

  const webhookUrl = process.env.DISCORD_HADIYA_WEBHOOK_URL;
  if (!webhookUrl) {
    // Not configured: acknowledge without pretending anything was delivered.
    return json({ ok: true, delivered: false });
  }

  const content = `Hadiya confirmed on Amalyn - ${regionLabel(region)} - channel: ${channelLabel(channel)} - ${new Date().toISOString()}`;
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`hadiya-confirm: webhook responded ${response.status}`);
      return json({ ok: true, delivered: false });
    }
  } catch (error) {
    console.error("hadiya-confirm: webhook unreachable", error);
    return json({ ok: true, delivered: false });
  }
  return json({ ok: true, delivered: true });
}
