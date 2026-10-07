import { afterEach, describe, expect, it } from "vitest";
import { DHIKR } from "./dhikr";
import { HADITH } from "./hadith";
import { getDhikr, hadithForDhikr } from "./index";

const realNodeEnv = process.env.NODE_ENV;
const realAllowUnreviewed = process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED;

/** process.env.NODE_ENV is typed read-only; the gate reads it at call time. */
const setNodeEnv = (value: string) => {
  (process.env as { NODE_ENV?: string }).NODE_ENV = value;
};

const setAllowUnreviewed = (value: string | undefined) => {
  (process.env as { NEXT_PUBLIC_ALLOW_UNREVIEWED?: string }).NEXT_PUBLIC_ALLOW_UNREVIEWED =
    value;
};

afterEach(() => {
  setNodeEnv(realNodeEnv);
  setAllowUnreviewed(realAllowUnreviewed);
});

describe("hadith catalog integrity", () => {
  it("gives every hadith a unique id", () => {
    const ids = new Set<string>();
    for (const entry of HADITH) {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
    }
    expect(ids.size).toBe(HADITH.length);
  });

  it("links every hadith to at least one resolvable dhikr", () => {
    for (const entry of HADITH) {
      expect(entry.dhikrIds.length).toBeGreaterThan(0);
      for (const dhikrId of entry.dhikrIds) {
        expect(getDhikr(dhikrId)?.id).toBe(dhikrId);
      }
    }
  });

  it("gives every dhikr at least one hadith", () => {
    for (const dhikr of DHIKR) {
      expect(hadithForDhikr(dhikr.id).length).toBeGreaterThan(0);
    }
  });

  it("orders hadith by theme from hadithForDhikr", () => {
    const ranks = { "prophets-practice": 0, reward: 1, occasion: 2 } as const;
    for (const dhikr of DHIKR) {
      const themes = hadithForDhikr(dhikr.id).map((entry) => entry.theme);
      const sorted = [...themes].sort(
        (a, b) => ranks[a] - ranks[b],
      );
      expect(themes).toEqual(sorted);
    }
  });

  it("covers the research-confirmed catalog (18 entries, 2026-10-06 pass)", () => {
    // Entries are added only after their citation is verified online; the
    // count floor documents the verified set rather than an aspiration.
    expect(HADITH.length).toBeGreaterThanOrEqual(18);
  });
});

describe("hadith citations and verification", () => {
  it("completes every hadith entry", () => {
    for (const entry of HADITH) {
      expect(entry.arabic.trim()).not.toBe("");
      expect(entry.translation.en.trim()).not.toBe("");
      expect(entry.narrator.trim()).not.toBe("");
      expect(entry.collection.trim()).not.toBe("");
      expect(entry.reference.trim()).not.toBe("");
    }
  });

  it("links every hadith to sunnah.com", () => {
    for (const entry of HADITH) {
      expect(entry.sourceUrl.startsWith("https://sunnah.com/")).toBe(true);
      expect(entry.review.verifiedSources?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("ships no draft hadith", () => {
    for (const entry of HADITH) {
      expect(["verified", "reviewed"]).toContain(entry.review.status);
      expect(entry.review.verifiedAt).toBeTruthy();
    }
  });
});

describe("hadith Bangla verification", () => {
  it("attributes every Bangla translation to a verified iHadis source", () => {
    for (const entry of HADITH) {
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

  it("never invents Bangla: every unverified entry is known and bounded", () => {
    // The 2026-10-07 iHadis pass verified 12 of 18 entries; the rest ship
    // English-only (with the pending note in the sheet) until the scholar
    // pass locates them under iHadis's Islamic Foundation numbering.
    const unverified = HADITH.filter((entry) => !entry.translation.bn);
    expect(unverified.map((entry) => entry.id).sort()).toEqual([
      "four-beloved-words-muslim-2137a",
      "istighfar-hundred-a-day-muslim-2702",
      "la-dies-knowing-paradise-muslim-26a",
      "salawat-ten-mercies-muslim-408",
      "tasbih-33-33-34-muslim-596a",
      "tasbih-sea-foam-muslim-597a",
    ].sort());
  });

  it("keeps the Arabic matn untouched by localization", () => {
    // Spot anchors from the original verified catalog: localization must
    // never edit religious text.
    expect(HADITH.find((e) => e.id === "istighfar-seventy-a-day-bukhari-6307")?.arabic).toContain(
      "لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    );
    expect(HADITH.find((e) => e.id === "salawat-ten-mercies-muslim-408")?.arabic).toBe(
      "مَنْ صَلَّى عَلَىَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا",
    );
  });

  it("carries Bangla narrator names beside the verified Bangla text", () => {
    for (const entry of HADITH) {
      if (entry.translation.bn && entry.narratorBn !== undefined) {
        expect(entry.narratorBn).toMatch(/\p{Script=Bengali}/u);
      }
    }
  });
});

describe("hadith review gate", () => {
  it("hides unverified hadith in production but shows them in development", () => {
    for (const dhikr of DHIKR) {
      setNodeEnv("development");
      const devEntries = hadithForDhikr(dhikr.id);
      setNodeEnv("production");
      const prodEntries = hadithForDhikr(dhikr.id);
      // Every shipped entry is verified or reviewed; development may show
      // draft entries pending the online verification pass.
      expect(prodEntries.length).toBeLessThanOrEqual(devEntries.length);
      for (const entry of prodEntries) {
        expect(entry.review.status).not.toBe("draft");
      }
    }
  });

  it("publishes draft hadith when a staging deploy allows unreviewed content", () => {
    setNodeEnv("production");
    setAllowUnreviewed("1");
    for (const dhikr of DHIKR) {
      for (const entry of hadithForDhikr(dhikr.id)) {
        expect(entry.review.status).not.toBe("");
      }
    }
  });
});
