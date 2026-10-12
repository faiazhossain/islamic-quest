import { describe, expect, it } from "vitest";

import {
  containsBengali,
  draftLangs,
  generateDraft,
  TEMPLATE_VERSION,
} from "./drafting.ts";
import { challengeUrl } from "./link.ts";
import type { Community } from "./types.ts";

const BASE: Pick<
  Community,
  "dedupKey" | "displayName" | "focus" | "lang" | "dhikrId"
> = {
  dedupKey: "fb:group:example",
  displayName: "Example Dhikr Group",
  focus: "daily morning and evening adhkar",
  lang: "en",
  dhikrId: "astaghfirullah",
};

function input(overrides: Partial<typeof BASE> = {}) {
  return {
    community: { ...BASE, ...overrides },
    template: "post" as const,
    siteUrl: "https://amalyn.vercel.app",
  };
}

describe("generateDraft", () => {
  it("is deterministic for identical inputs", () => {
    const a = generateDraft(input());
    const b = generateDraft(input());
    expect(a).toEqual(b);
  });

  it("embeds the plain challenge deep link and honest framing", () => {
    const { en } = generateDraft(input());
    const expectedLink = challengeUrl("astaghfirullah", {
      siteUrl: "https://amalyn.vercel.app",
    });
    expect(en).toContain(expectedLink);
    expect(en).toContain("free");
    expect(en).toContain("Full disclosure");

    const { bn } = generateDraft(input({ lang: "bn" }));
    expect(bn).toContain(expectedLink);
    expect(bn).toContain("ফ্রি");
  });

  it("renders Bangla that is actually Bangla", () => {
    const { bn } = generateDraft(input({ lang: "bn" }));
    expect(containsBengali(bn as string)).toBe(true);
  });

  it("renders both languages for mixed-language communities", () => {
    const draft = generateDraft(input({ lang: "mixed" }));
    expect(draft.en).toBeTruthy();
    expect(draft.bn).toBeTruthy();
    expect(draft.fingerprint.length).toBe(40);
  });

  it("falls back to English for unknown language", () => {
    expect(draftLangs("unknown")).toEqual(["en"]);
    const draft = generateDraft(input({ lang: "unknown" }));
    expect(draft.en).toBeTruthy();
    expect(draft.bn).toBeNull();
  });

  it("keeps religious-reward claims and fabricated figures out of drafts", () => {
    for (const lang of ["en", "bn"] as const) {
      const draft = generateDraft(input({ lang }));
      const text = `${draft.en ?? ""}\n${draft.bn ?? ""}`;
      expect(text.toLowerCase()).not.toMatch(/sawab|সওয়াব/);
      expect(text).not.toMatch(/\d[\d,]*\s*(members|memberss|সদস্য)/);
      expect(text).not.toMatch(/guaranteed|guarantees|100%/i);
    }
  });

  it("guarantees no two communities receive identical text", () => {
    const taken = new Set<string>();
    const drafts: string[] = [];
    for (let i = 0; i < 12; i++) {
      const generated = generateDraft(
        input({
          dedupKey: `fb:group:community${i}`,
          displayName: `Community ${i} Dhikr Circle`,
          lang: i % 2 === 0 ? "en" : "bn",
        }),
      );
      expect(taken.has(generated.fingerprint)).toBe(false);
      taken.add(generated.fingerprint);
      drafts.push(`${generated.en ?? ""}${generated.bn ?? ""}`);
    }
    expect(new Set(drafts).size).toBe(drafts.length);
  });

  it("advances the variant when a fingerprint collides with an issued draft", () => {
    // The natural draft for the second community:
    const natural = generateDraft(input({ dedupKey: "fb:group:other" }));
    // Force a collision: the taken set holds that fingerprint, so the
    // generator must roll forward.
    const advanced = generateDraft({
      ...input({ dedupKey: "fb:group:other" }),
      taken: new Set([natural.fingerprint]),
    });
    expect(advanced.variant).toBeGreaterThan(natural.variant);
    expect(advanced.fingerprint).not.toBe(natural.fingerprint);
  });

  it("honors an explicit variant for operator re-rolls", () => {
    const v7 = generateDraft({ ...input(), variant: 7 });
    const v7again = generateDraft({ ...input(), variant: 7 });
    expect(v7).toEqual(v7again);
    expect(v7.variant).toBe(7);
  });

  it("switches templates without changing the module contract", () => {
    const permission = generateDraft({ ...input(), template: "permission" });
    expect(permission.en).toContain("permission");
    expect(permission.en).toContain("Full disclosure");

    const permissionBn = generateDraft({
      ...input({ lang: "bn" }),
      template: "permission",
    });
    expect(permissionBn.bn).toContain("অনুমতি");
    expect(containsBengali(permissionBn.bn as string)).toBe(true);
  });

  it("uses a default dhikr when none is set", () => {
    // One feature slot deliberately skips the challenge mention, so
    // assert across variants that the default phrase does appear.
    const mentioned = [0, 1, 2, 3, 4]
      .map((variant) =>
        generateDraft({ ...input({ dhikrId: null }), variant }),
      )
      .filter((draft) =>
        (draft.en ?? "").includes("30 days of your chosen dhikr"),
      );
    expect(mentioned.length).toBeGreaterThan(0);

    // And a named dhikr never leaks when none was chosen.
    const unnamed = generateDraft({ ...input({ dhikrId: null }), variant: 0 });
    expect(unnamed.en).not.toContain("Astaghfirullah");
  });

  it("requires a recorded focus phrase and refuses to invent one", () => {
    expect(() => generateDraft(input({ focus: "  " }))).toThrow(
      /requires a short focus phrase/,
    );
    expect(() => generateDraft(input({ focus: "x".repeat(120) }))).toThrow(
      /under 80/,
    );
  });
});

describe("template version", () => {
  it("is pinned so stored drafts stay reproducible", () => {
    expect(TEMPLATE_VERSION).toBe(1);
  });
});
