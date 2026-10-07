import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_FEEDBACK_MESSAGE } from "@/lib/feedback";

/**
 * Mutable state the mocked limiter reads at call time, so tests can
 * exercise the fixed window without waiting on real time.
 */
const state = vi.hoisted(() => ({
  allow: true,
}));

vi.mock("@/lib/server/rate-limit", () => ({
  rateLimit: () => state.allow,
}));

import { POST } from "./route";

const ORIGIN = "http://amalyn.test";
const WEBHOOK = "https://discord.test/webhook/hook";

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(new Request(`${ORIGIN}/api/feedback`, {
    method: "POST",
    // Constructed Requests carry no Host header (undici derives it at
    // transmission time), so the same-origin check reads x-forwarded-host,
    // exactly as the sync route tests do.
    headers: {
      "content-type": "application/json",
      origin: ORIGIN,
      "x-forwarded-host": "amalyn.test",
      ...headers,
    },
    body,
  }));

const validBody = JSON.stringify({
  topic: "mistake",
  message: "The Bangla translation misses a phrase.",
  contact: "user@example.com",
});

const mockedFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  state.allow = true;
  mockedFetch.mockReset();
  vi.stubGlobal("fetch", mockedFetch);
  mockedFetch.mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubEnv("DISCORD_FEEDBACK_WEBHOOK_URL", WEBHOOK);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("feedback route", () => {
  it("rejects cross-origin requests", async () => {
    const response = await post(validBody, { origin: "https://evil.example" });
    expect(response.status).toBe(403);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("answers 503 when the webhook is not configured", async () => {
    vi.stubEnv("DISCORD_FEEDBACK_WEBHOOK_URL", "");
    const response = await post(validBody);
    expect(response.status).toBe(503);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("rejects malformed, oversized, and out-of-contract bodies", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post("x".repeat(5000))).status).toBe(400);
    expect((await post(JSON.stringify({ topic: "spam", message: "hi" }))).status).toBe(400);
    expect((await post(JSON.stringify({ topic: "mistake", message: "" }))).status).toBe(400);
    expect(
      (await post(
        JSON.stringify({ topic: "mistake", message: "x".repeat(MAX_FEEDBACK_MESSAGE + 1) }),
      )).status,
    ).toBe(400);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("pings @everyone and carries the report without leaking the webhook", async () => {
    const response = await post(validBody);
    expect(response.status).toBe(200);
    const text = await response.text();
    // The webhook URL is a secret; it must never echo in a response.
    expect(text).not.toContain("discord.test");
    expect(JSON.parse(text)).toEqual({ ok: true, delivered: true });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(WEBHOOK);
    const payload = JSON.parse((init as RequestInit).body as string);
    expect(payload.content).toBe("@everyone");
    expect(payload.allowed_mentions).toEqual({ parse: ["everyone"] });
    expect(payload.embeds[0].title).toContain("Reported mistake");
    expect(payload.embeds[0].description).toContain("Bangla translation");
    expect(payload.embeds[0].fields[0].value).toBe("user@example.com");
  });

  it("normalizes blank contact to not given", async () => {
    await post(JSON.stringify({ topic: "suggestion", message: "Add a dark mode toggle.", contact: "  " }));
    const payload = JSON.parse((mockedFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(payload.embeds[0].fields[0].value).toBe("not given");
    expect(payload.embeds[0].title).toContain("App feedback");
  });

  it("answers 502 when Discord is unreachable or erroring", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("offline"));
    let response = await post(validBody);
    expect(response.status).toBe(502);

    mockedFetch.mockResolvedValueOnce(new Response(null, { status: 404 }));
    response = await post(validBody);
    expect(response.status).toBe(502);
  });

  it("rate-limits repeat reports from one address", async () => {
    state.allow = false;
    const response = await post(validBody);
    expect(response.status).toBe(429);
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
