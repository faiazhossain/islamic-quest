import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  challengeUrl,
  DHIKR_IDS,
  isDhikrId,
  SITE_URL,
} from "./link.ts";
// Direct import of the app catalog: the strongest possible cross-check.
import { DHIKR } from "../../src/lib/content/dhikr.ts";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("challengeUrl", () => {
  it("builds a plain deep link to the challenge surface", () => {
    expect(challengeUrl("subhanallah")).toBe(
      `${SITE_URL}/challenge?amal=subhanallah`,
    );
  });

  it("carries no tracking or attribution parameters", () => {
    for (const id of DHIKR_IDS) {
      expect(challengeUrl(id)).not.toMatch(/[&?]utm_|fbclid|gclid/i);
    }
  });

  it("honors an explicit site override over the env fallback", () => {
    vi.stubEnv("OUTREACH_SITE_URL", "https://staging.example.org");
    const url = challengeUrl("hawqala", { siteUrl: "https://preview.example.org" });
    expect(url.startsWith("https://preview.example.org/challenge")).toBe(true);
    expect(url.includes("staging.example.org")).toBe(false);
  });

  it("rejects ids that are not in the catalog", () => {
    expect(() => challengeUrl("made-up")).toThrow(/unknown dhikr id/);
  });
});

describe("catalog guards", () => {
  it("keeps SITE_URL in sync with src/lib/site.ts", () => {
    // fs + regex rather than an import: src/lib/site.ts may grow app
    // dependencies later, and this guard must keep working regardless.
    const siteTs = readFileSync(
      path.resolve(import.meta.dirname, "../../src/lib/site.ts"),
      "utf8",
    );
    const match = siteTs.match(/SITE_URL\s*=\s*"([^"]+)"/);
    expect(match, "SITE_URL not found in src/lib/site.ts").toBeTruthy();
    expect(match?.[1]).toBe(SITE_URL);
  });

  it("only offers dhikr ids that exist in the app catalog", () => {
    const catalogIds = new Set(DHIKR.map((entry) => entry.id));
    for (const id of DHIKR_IDS) {
      expect(catalogIds.has(id), `id ${id} missing from src/lib/content/dhikr.ts`).toBe(true);
    }
    // And the reverse spot-check: the catalog never shrinks silently.
    expect(DHIKR_IDS.length).toBe(DHIKR.length);
  });

  it("every catalog id passes the type guard", () => {
    for (const id of DHIKR_IDS) expect(isDhikrId(id)).toBe(true);
    expect(isDhikrId("nope")).toBe(false);
  });
});
