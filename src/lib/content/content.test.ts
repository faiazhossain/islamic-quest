import { afterEach, describe, expect, it } from "vitest";
import { localized } from "../i18n/localized";
import { CATEGORIES } from "./categories";
import { DHIKR } from "./dhikr";
import {
  dhikrForQuest,
  getPublicQuest,
  getQuest,
  publicQuests,
  QUESTS,
} from "./index";

const BENGALI = /\p{Script=Bengali}/u;

/** Every LocalizedText in the catalog must carry a real Bangla field. */
function expectBn(text: { en: string; bn?: string }, where: string): void {
  expect(text.bn?.trim(), `${where} missing bn`).not.toBe("");
  expect(text.bn, `${where} bn is not Bengali script`).toMatch(BENGALI);
  expect(localized(text, "bn")).toBe(text.bn);
}

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

describe("catalog integrity", () => {
  it("gives every quest a resolvable dhikr, sane target, and unique id", () => {
    const ids = new Set<string>();
    for (const quest of QUESTS) {
      expect(() => dhikrForQuest(quest)).not.toThrow();
      expect(Number.isInteger(quest.target)).toBe(true);
      expect(quest.target).toBeGreaterThan(0);
      expect(ids.has(quest.id)).toBe(false);
      ids.add(quest.id);
    }
    expect(ids.size).toBe(QUESTS.length);
  });
});

describe("Bangla content coverage", () => {
  it("writes Bangla for every category name and description", () => {
    for (const category of CATEGORIES) {
      expectBn(category.name, `category ${category.id} name`);
      expectBn(category.description, `category ${category.id} description`);
    }
  });

  it("writes Bangla for every dhikr name, meaning, guidance, and note", () => {
    for (const dhikr of DHIKR) {
      expectBn(dhikr.names, `dhikr ${dhikr.id} names`);
      expectBn(dhikr.meaning, `dhikr ${dhikr.id} meaning`);
      expectBn(dhikr.practiceGuidance, `dhikr ${dhikr.id} practiceGuidance`);
      if (dhikr.source.note) {
        expectBn(dhikr.source.note, `dhikr ${dhikr.id} source note`);
      }
    }
  });
});

describe("production review gate", () => {
  it("publishes only scholar-reviewed dhikr in production", () => {
    setNodeEnv("production");
    for (const quest of publicQuests()) {
      expect(dhikrForQuest(quest).review.status).toBe("reviewed");
    }
    const reviewedDhikr = new Set(
      DHIKR.filter((d) => d.review.status === "reviewed").map((d) => d.id),
    );
    for (const quest of QUESTS) {
      const shouldPublish = reviewedDhikr.has(quest.dhikrId);
      expect(publicQuests().some((q) => q.id === quest.id)).toBe(shouldPublish);
    }
  });

  it("shows the whole catalog in development", () => {
    setNodeEnv("development");
    expect(publicQuests()).toHaveLength(QUESTS.length);
  });

  it("publishes the whole catalog when a staging deploy allows unreviewed content", () => {
    setNodeEnv("production");
    setAllowUnreviewed("1");
    expect(publicQuests()).toHaveLength(QUESTS.length);
    expect(getPublicQuest(QUESTS[0].id)?.id).toBe(QUESTS[0].id);
  });

  it("keeps the gate closed when the staging flag is anything but 1", () => {
    setNodeEnv("production");
    setAllowUnreviewed("true");
    for (const quest of publicQuests()) {
      expect(dhikrForQuest(quest).review.status).toBe("reviewed");
    }
  });

  it("gates deep links the same way as the lists", () => {
    const quest = QUESTS[0];
    setNodeEnv("production");
    const reviewed =
      dhikrForQuest(quest).review.status === "reviewed" ? quest : undefined;
    expect(getPublicQuest(quest.id)?.id).toBe(reviewed?.id ?? undefined);
    setNodeEnv("development");
    expect(getPublicQuest(quest.id)?.id).toBe(getQuest(quest.id)?.id);
  });
});
