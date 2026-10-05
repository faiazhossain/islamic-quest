import { afterEach, describe, expect, it } from "vitest";
import { DHIKR } from "./dhikr";
import {
  dhikrForQuest,
  getPublicQuest,
  getQuest,
  publicQuests,
  QUESTS,
} from "./index";

const realNodeEnv = process.env.NODE_ENV;

/** process.env.NODE_ENV is typed read-only; the gate reads it at call time. */
const setNodeEnv = (value: string) => {
  (process.env as { NODE_ENV?: string }).NODE_ENV = value;
};

afterEach(() => {
  setNodeEnv(realNodeEnv);
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
