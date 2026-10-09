import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DHIKR } from "./dhikr";
import {
  normalizeToken,
  resetSearchIndex,
  searchContent,
} from "./search";

/**
 * The mandated discovery set (2026-10-08 brief): a user must reach
 * Rizq-related content via রিজিক / রিজ / rizq / rizik / rijik /
 * sustenance / provision, patience content via ধৈর্য / sabr /
 * patience, and forgiveness content via ক্ষমা / khoma / istighfar /
 * tawbah — without knowing any amal's exact title. Tests run in the
 * NODE_ENV=test gate, so the full (verified) catalog is indexed.
 */

const dhikrIds = (query: string): string[] =>
  searchContent(query).dhikrs.map((hit) => hit.dhikrId);

describe("normalization", () => {
  it("strips ZWNJ/ZWJ and hasant from Bangla", () => {
    expect(normalizeToken("রিজি\u200Cক")).toBe(normalizeToken("রিজিক"));
    expect(normalizeToken("রিজি\u09CDক")).toBe(normalizeToken("রিজিক"));
  });

  it("folds Latin diacritics and apostrophes", () => {
    expect(normalizeToken("A'ūdhu")).toBe(normalizeToken("audhu"));
    expect(normalizeToken("Allāhu")).toBe("allahu");
  });

  it("strips Arabic harakat and tatweel", () => {
    expect(normalizeToken("أَسْتَغْفِرُ")).toBe(normalizeToken("استغفر"));
    expect(normalizeToken("الــلــه")).toBe(normalizeToken("الله"));
  });
});

describe("searchContent", () => {
  it("returns empty for sub-minimum queries", () => {
    expect(searchContent("")).toEqual({ dhikrs: [], topics: [] });
    expect(searchContent(" ")).toEqual({ dhikrs: [], topics: [] });
    expect(searchContent("a")).toEqual({ dhikrs: [], topics: [] });
    expect(searchContent("রি")).toEqual({ dhikrs: [], topics: [] });
  });

  it("matches exact titles in both languages", () => {
    expect(dhikrIds("Astaghfirullah")).toContain("astaghfirullah");
    expect(dhikrIds("আস্তাগফিরুল্লাহ")).toContain("astaghfirullah");
    expect(dhikrIds("alhamdulillah")).toContain("alhamdulillah");
  });

  it("matches title prefixes conservatively", () => {
    expect(dhikrIds("astagh")).toContain("astaghfirullah");
    expect(dhikrIds("আস্তাগ")).toContain("astaghfirullah");
  });

  it("reaches rizq content via Bangla, English, and Banglish", () => {
    for (const query of ["রিজিক", "রিজিক বৃদ্ধি", "রুজি", "জীবিকা"]) {
      const topicIds = searchContent(query).topics.map((t) => t.topicId);
      expect(topicIds, query).toContain("rizq");
    }
    // The verified rizq dua itself must surface for the core queries.
    for (const query of ["রিজিক", "rizq", "rizik", "rijik", "sustenance", "provision"]) {
      expect(dhikrIds(query), query).toContain("rabbi-inni-lima-anzalta");
    }
  });

  it("prefixes রিজ into রিজিক via the rizq topic", () => {
    const topicIds = searchContent("রিজ").topics.map((t) => t.topicId);
    expect(topicIds).toContain("rizq");
  });

  it("reaches rizq via English synonyms", () => {
    for (const query of ["rizq", "rizik", "rijik", "sustenance", "provision"]) {
      const topicIds = searchContent(query).topics.map((t) => t.topicId);
      expect(topicIds, query).toContain("rizq");
    }
  });

  it("reaches patience content via ধৈর্য / sabr / patience", () => {
    for (const query of ["ধৈর্য", "সবর", "sabor", "sabr", "patience"]) {
      const topicIds = searchContent(query).topics.map((t) => t.topicId);
      expect(topicIds, query).toContain("sabr");
    }
    // The calamity dua surfaces under sabr queries via its occasion link.
    for (const query of ["ধৈর্য", "sabr", "patience", "musibot", "মুসিবত"]) {
      expect(dhikrIds(query), query).toContain("inna-lillahi-wa-inna-ilayhi-rajion");
    }
  });

  it("reaches forgiveness content via ক্ষমা / khoma / istighfar / tawbah", () => {
    for (const query of ["ক্ষমা", "khoma", "choma", "istighfar", "istegfar", "tawbah"]) {
      const dhikrs = dhikrIds(query);
      expect(dhikrs, query).toContain("astaghfirullah");
      expect(dhikrs, query).toContain("sayyid-ul-istighfar");
    }
  });

  it("reaches sleep content via ghum", () => {
    const topicIds = searchContent("ghum").topics.map((t) => t.topicId);
    expect(topicIds).toContain("sleep-evening");
    expect(dhikrIds("ghum")).toContain("bismika-allahumma-amutu-wa-ahya");
    expect(dhikrIds("ghum")).toContain("ayat-al-kursi");
  });

  it("reaches anxiety content via দুশ্চিন্তা / anxiety", () => {
    for (const query of ["দুশ্চিন্তা", "duschinta", "anxiety", "worry"]) {
      const topicIds = searchContent(query).topics.map((t) => t.topicId);
      expect(topicIds, query).toContain("anxiety-worry");
      expect(dhikrIds(query), query).toContain("audhu-min-hammi-wal-hazan");
    }
  });

  it("reaches protection content via হেফাজত / protection", () => {
    for (const query of ["হেফাজত", "hefazot", "protection"]) {
      expect(dhikrIds(query), query).toContain("audhu-bikalimatillah-it-tammat");
      expect(dhikrIds(query), query).toContain("bismillahilladhi-la-yadurru");
    }
  });

  it("reaches tawakkul content via ভরসা / tawakkul", () => {
    for (const query of ["ভরসা", "tawakkul", "hasbunallah"]) {
      expect(dhikrIds(query), query).toContain("hasbunallahu-wa-nimal-wakil");
    }
  });

  it("reaches parents content via বাবা-মা / parents", () => {
    for (const query of ["বাবা-মা", "parents", "hamhuma"]) {
      expect(dhikrIds(query), query).toContain("rabbir-hamhuma");
    }
  });

  it("matches aliased Banglish variants per amal", () => {
    expect(dhikrIds("istanja")).toContain("astaghfirullah");
    expect(dhikrIds("takbir")).toContain("allahu-akbar");
    expect(dhikrIds("durod")).toContain("salawat-ibrahimiyya");
  });

  it("ranks an exact title above a meaning-text graze", () => {
    const hits = searchContent("Alhamdulillah").dhikrs;
    expect(hits[0].dhikrId).toBe("alhamdulillah");
    expect(hits[0].score).toBeGreaterThanOrEqual(100);
  });

  it("keeps result order stable for identical queries", () => {
    const a = searchContent("জিকির").dhikrs.map((hit) => hit.dhikrId);
    const b = searchContent("জিকির").dhikrs.map((hit) => hit.dhikrId);
    expect(a).toEqual(b);
  });

  it("is insensitive to ZWNJ in user input", () => {
    const plain = searchContent("রিজিক");
    const marked = searchContent("রিজি\u200Cক");
    expect(marked.topics).toEqual(plain.topics);
  });

  it("never returns drafts over the production gate", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED;
    resetSearchIndex();
    try {
      const indexed = new Set(
        searchContent("astaghfirullah").dhikrs.map((hit) => hit.dhikrId),
      );
      for (const hit of searchContent("ক্ষমা").dhikrs) {
        indexed.add(hit.dhikrId);
      }
      const published = new Set(
        DHIKR.filter((dhikr) => dhikr.review.status === "verified").map((d) => d.id),
      );
      // No draft dhikr can ever surface in production results.
      for (const dhikr of DHIKR) {
        if (dhikr.review.status !== "verified") {
          expect(indexed.has(dhikr.id)).toBe(false);
        } else {
          expect(published.has(dhikr.id)).toBe(true);
        }
      }
    } finally {
      vi.unstubAllEnvs();
      resetSearchIndex();
    }
  });
});

beforeEach(() => {
  resetSearchIndex();
});

afterEach(() => {
  resetSearchIndex();
  vi.unstubAllEnvs();
});
