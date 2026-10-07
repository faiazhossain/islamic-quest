import { describe, expect, it } from "vitest";
import { HADIYA_HADITH } from "./hadiya-hadith";

describe("hadiya hadith catalog integrity", () => {
  it("gives every hadith a unique id", () => {
    const ids = new Set<string>();
    for (const entry of HADIYA_HADITH) {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
    }
    expect(ids.size).toBe(HADIYA_HADITH.length);
  });

  it("completes every hadith entry", () => {
    for (const entry of HADIYA_HADITH) {
      expect(entry.arabic.trim()).not.toBe("");
      expect(entry.translation.en.trim()).not.toBe("");
      expect(entry.narrator.trim()).not.toBe("");
      expect(entry.collection.trim()).not.toBe("");
      expect(entry.reference.trim()).not.toBe("");
    }
  });

  it("ships only citation-verified hadith linked to sunnah.com", () => {
    expect(HADIYA_HADITH.length).toBeGreaterThanOrEqual(4);
    for (const entry of HADIYA_HADITH) {
      expect(entry.sourceUrl.startsWith("https://sunnah.com/")).toBe(true);
      expect(entry.review.status).toBe("verified");
      expect(entry.review.verifiedAt).toBeTruthy();
      expect(entry.review.verifiedSources?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("hadiya hadith Bangla verification", () => {
  it("attributes every Bangla translation to a verified iHadis source", () => {
    for (const entry of HADIYA_HADITH) {
      const bn = entry.translation.bn;
      if (bn === undefined) continue;
      // The verbatim rule: a Bangla text may ship only when the exact
      // iHadis page it was extracted from is recorded as a source.
      expect(
        entry.review.verifiedSources?.some((source) =>
          source.startsWith("https://ihadis.com/"),
        ),
        `entry ${entry.id} ships bn without an iHadis source`,
      ).toBe(true);
      expect(bn.trim()).not.toBe("");
      expect(bn).toMatch(/\p{Script=Bengali}/u);
    }
  });

  it("ships Bangla on every entry (all four verified on iHadis)", () => {
    // Unlike the guidance catalog, this set is fully bilingual by design:
    // every entry was picked from a collection whose numbering iHadis
    // shares, so the Support page never falls back to the pending note.
    for (const entry of HADIYA_HADITH) {
      expect(entry.translation.bn, `entry ${entry.id} lost its bn`).toBeDefined();
      expect(entry.narratorBn, `entry ${entry.id} lost its bn narrator`).toBeDefined();
    }
  });

  it("keeps the Arabic matn untouched by localization", () => {
    expect(
      HADIYA_HADITH.find((e) => e.id === "hadiya-accepted-and-rewarded-bukhari-2585")
        ?.arabic,
    ).toBe("كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يَقْبَلُ الْهَدِيَّةَ وَيُثِيبُ عَلَيْهَا");
    expect(
      HADIYA_HADITH.find((e) => e.id === "hadiya-half-a-date-bukhari-1417")?.arabic,
    ).toBe("اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ");
  });
});
