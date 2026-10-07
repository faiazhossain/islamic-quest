import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(new Request(`${ORIGIN}/api/hadiya-confirm`, {
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

const mockedFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  mockedFetch.mockReset();
  vi.stubGlobal("fetch", mockedFetch);
  mockedFetch.mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubEnv("DISCORD_HADIYA_WEBHOOK_URL", "https://discord.test/webhook/hook");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("hadiya-confirm route", () => {
  it("rejects cross-origin requests", async () => {
    const response = await post(
      JSON.stringify({ channel: "bkash", region: "bd" }),
      { origin: "https://evil.example" },
    );
    expect(response.status).toBe(403);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("rejects malformed and oversized bodies", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post("x".repeat(600))).status).toBe(400);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("ignores unknown field values instead of forwarding them", async () => {
    await post(
      JSON.stringify({ channel: "https://evil.example", region: 42, extra: "x" }),
    );
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe("https://discord.test/webhook/hook");
    const payload = JSON.parse((init as RequestInit).body as string);
    expect(payload.content).toContain("Unspecified - channel: Unspecified");
    expect(payload.content).not.toContain("evil");
    expect(payload.content).not.toContain("extra");
  });

  it("forwards a minimal note and reports delivery", async () => {
    const response = await post(JSON.stringify({ channel: "bkash", region: "bd" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, delivered: true });
    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe("https://discord.test/webhook/hook");
    const payload = JSON.parse((init as RequestInit).body as string);
    expect(payload.content).toContain("Inside Bangladesh");
    expect(payload.content).toContain("bKash");
    expect(payload.content).not.toContain("@");
  });

  it("acknowledges without delivery when the webhook is not configured", async () => {
    vi.stubEnv("DISCORD_HADIYA_WEBHOOK_URL", "");
    const response = await post(JSON.stringify({ region: "intl" }));
    await expect(response.json()).resolves.toEqual({ ok: true, delivered: false });
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("still thanks the giver when Discord is unreachable or erroring", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("offline"));
    let response = await post(JSON.stringify({}));
    await expect(response.json()).resolves.toEqual({ ok: true, delivered: false });

    mockedFetch.mockResolvedValueOnce(new Response(null, { status: 404 }));
    response = await post(JSON.stringify({}));
    await expect(response.json()).resolves.toEqual({ ok: true, delivered: false });
  });

  it("rate-limits repeat confirmations from one address", async () => {
    state.allow = false;
    const response = await post(JSON.stringify({ region: "bd" }));
    expect(response.status).toBe(429);
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
