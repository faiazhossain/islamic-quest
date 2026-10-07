import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/config";
import { parseFeedback } from "@/lib/feedback";
import { isSameOrigin } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

/**
 * Relays feedback and mistake reports from the /feedback form to the
 * founder's Discord channel. The webhook URL is a secret that posts to a
 * private channel, so it lives in the server environment and never
 * reaches the client bundle.
 *
 * Unlike the best-effort hadiya-confirm ping, a feedback message that
 * silently vanishes is a real loss: the visitor leaves believing their
 * correction reached the developer. So an unconfigured or unreachable
 * webhook is an honest failure (503/502) that the form surfaces, not a
 * pretend success.
 */

/** A full message (2000 chars) plus contact and JSON overhead stays under this. */
const MAX_BODY_BYTES = 4096;
/** Per-IP fixed window; the webhook is the abuse surface being protected. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 600_000;
const WEBHOOK_TIMEOUT_MS = 10_000;

const TOPIC_TITLES: Record<string, string> = {
  mistake: "Reported mistake",
  suggestion: "App feedback",
};

function json(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("cache-control", "no-store");
  return response;
}

/** Builds the Discord message: an @everyone ping plus the report as an embed. */
function discordPayload(submission: {
  topic: string;
  message: string;
  contact: string | null;
}): string {
  return JSON.stringify({
    content: "@everyone",
    allowed_mentions: { parse: ["everyone"] },
    embeds: [
      {
        title: `${TOPIC_TITLES[submission.topic] ?? "Feedback"} - Amalyn`,
        description: submission.message,
        color: 0x3d8361,
        fields: [
          {
            name: "Contact",
            value: submission.contact ?? "not given",
          },
        ],
        footer: { text: `Amalyn v${APP_VERSION}` },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ error: "origin_blocked" }, { status: 403 });
  }
  // x-forwarded-for is spoofable, so this throttles casual spam rather
  // than defending against a determined adversary; Discord applies its
  // own rate limits behind this.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`feedback:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return json({ error: "rate_limited" }, { status: 429 });
  }

  const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return json({ error: "feedback_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: "bad_request" }, { status: 400 });
    }
    body = JSON.parse(raw);
  } catch {
    return json({ error: "bad_request" }, { status: 400 });
  }
  const submission = parseFeedback(body);
  if (submission === null) {
    return json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const delivered = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: discordPayload(submission),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    if (!delivered.ok) {
      console.error(`feedback: webhook responded ${delivered.status}`);
      return json({ error: "delivery_failed" }, { status: 502 });
    }
  } catch (error) {
    console.error("feedback: webhook unreachable", error);
    return json({ error: "delivery_failed" }, { status: 502 });
  }

  return json({ ok: true, delivered: true });
}
