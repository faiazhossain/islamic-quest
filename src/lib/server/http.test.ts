import { describe, expect, it } from "vitest";
import { isSameOrigin } from "./http";

const request = (headers: Record<string, string>): Request =>
  new Request("https://amalyn.example/api/sync", {
    method: "POST",
    headers,
  });

describe("isSameOrigin", () => {
  it("allows requests without an Origin (non-browser clients)", () => {
    expect(isSameOrigin(request({ host: "amalyn.example" }))).toBe(true);
  });

  it("allows a matching origin", () => {
    expect(
      isSameOrigin(
        request({ host: "amalyn.example", origin: "https://amalyn.example" }),
      ),
    ).toBe(true);
  });

  it("allows a matching x-forwarded-host behind a proxy", () => {
    expect(
      isSameOrigin(
        request({
          host: "internal:3000",
          "x-forwarded-host": "amalyn.example",
          origin: "https://amalyn.example",
        }),
      ),
    ).toBe(true);
  });

  it("uses only the first entry of a forwarded-host list", () => {
    expect(
      isSameOrigin(
        request({
          "x-forwarded-host": "amalyn.example, proxy:8080",
          origin: "https://amalyn.example",
        }),
      ),
    ).toBe(true);
  });

  it("rejects a cross-site origin", () => {
    expect(
      isSameOrigin(
        request({ host: "amalyn.example", origin: "https://evil.example" }),
      ),
    ).toBe(false);
  });

  it("rejects a malformed origin", () => {
    expect(
      isSameOrigin(request({ host: "amalyn.example", origin: "not a url" })),
    ).toBe(false);
  });

  it("rejects an origin when no host can be established", () => {
    expect(isSameOrigin(request({ origin: "https://evil.example" }))).toBe(false);
  });
});
