import { describe, expect, it } from "vitest";
import { publicQuests, type Quest } from "./content";
import { dayStartOf, dayKeyOrdinal, localDayKey } from "./format";
import {
  allQuestsCompleted,
  completedDhikrCount,
  completedQuests,
  derivePracticeStats,
  pickDailyAmal,
  type PracticeEvent,
} from "./practice";
import type { QuestProgress } from "./db/db";

/** Local epoch ms for a fixed calendar moment; immune to the test TZ. */
const at = (year: number, month: number, day: number, hour = 12): number =>
  new Date(year, month - 1, day, hour, 0, 0, 0).getTime();

const event = (questId: string, delta: number, atMs: number): PracticeEvent => ({
  questId,
  delta,
  at: atMs,
});

const progressFor = (
  questIds: ReadonlyArray<string>,
  completedAt = at(2026, 1, 1),
): Map<string, QuestProgress> =>
  new Map(
    questIds.map((questId) => [
      questId,
      { questId, count: 1, completedAt, updatedAt: completedAt },
    ]),
  );

describe("day keys", () => {
  it("changes key exactly at local midnight", () => {
    const late = at(2026, 3, 8, 23) + 59 * 60_000 + 59_999;
    const early = at(2026, 3, 9, 0);
    expect(localDayKey(late)).toBe("2026-03-08");
    expect(localDayKey(early)).toBe("2026-03-09");
  });

  it("keeps consecutive calendar days consecutive across a month boundary", () => {
    expect(dayKeyOrdinal("2026-01-31")).toBe(dayKeyOrdinal("2026-01-30") + 1);
    expect(dayKeyOrdinal("2026-02-01")).toBe(dayKeyOrdinal("2026-01-31") + 1);
  });

  it("derives day start from any epoch ms", () => {
    expect(dayStartOf(at(2026, 5, 4, 18) + 30 * 60_000)).toBe(at(2026, 5, 4, 0));
  });
});

describe("derivePracticeStats", () => {
  const now = at(2026, 3, 10, 9);

  it("counts distinct practiced days", () => {
    const events = [
      event("a", 1, at(2026, 3, 8)),
      event("a", 1, at(2026, 3, 8, 20)),
      event("b", 1, at(2026, 3, 9)),
      event("c", 1, at(2026, 3, 10, 7)),
    ];
    expect(derivePracticeStats(events, now).daysPracticed).toBe(3);
  });

  it("does not count an undo-only day as practiced", () => {
    const events = [event("a", -1, at(2026, 3, 9))];
    const stats = derivePracticeStats(events, now);
    expect(stats.daysPracticed).toBe(0);
    expect(stats.bestRunDays).toBe(0);
  });

  it("counts a run ending today", () => {
    const events = [
      event("a", 1, at(2026, 3, 8)),
      event("a", 1, at(2026, 3, 9)),
      event("a", 1, at(2026, 3, 10, 7)),
    ];
    const stats = derivePracticeStats(events, now);
    expect(stats.currentRunDays).toBe(3);
    expect(stats.bestRunDays).toBe(3);
  });

  it("still shows a run ending yesterday without shaming a quiet morning", () => {
    const events = [
      event("a", 1, at(2026, 3, 8)),
      event("a", 1, at(2026, 3, 9)),
    ];
    const stats = derivePracticeStats(events, now);
    expect(stats.currentRunDays).toBe(2);
  });

  it("resets the current run after a gap but keeps the personal best", () => {
    const events = [
      event("a", 1, at(2026, 3, 1)),
      event("a", 1, at(2026, 3, 2)),
      event("a", 1, at(2026, 3, 3)),
      event("a", 1, at(2026, 3, 6)),
    ];
    const stats = derivePracticeStats(events, now);
    // Mar 6 is neither today nor yesterday, so the current run is empty;
    // the personal best is untouched.
    expect(stats.currentRunDays).toBe(0);
    expect(stats.bestRunDays).toBe(3);
  });

  it("clamps month totals at zero and separates months", () => {
    const events = [
      event("a", 1, at(2026, 2, 20)),
      event("a", 1, at(2026, 2, 21)),
      event("a", 1, at(2026, 3, 5)),
      event("a", -1, at(2026, 3, 6)),
      event("a", -1, at(2026, 3, 7)),
    ];
    const stats = derivePracticeStats(events, now);
    expect(stats.thisMonthCount).toBe(0);
    expect(stats.lastMonthCount).toBe(2);
  });
});

describe("completed quest derivations", () => {
  it("returns completed quests in catalog order", () => {
    const all = publicQuests();
    const progress = progressFor([all[2].id, all[0].id]);
    expect(completedQuests(progress).map((quest) => quest.id)).toEqual([
      all[0].id,
      all[2].id,
    ]);
  });

  it("is false until every public quest is complete", () => {
    const all = publicQuests();
    expect(allQuestsCompleted(new Map())).toBe(false);
    expect(allQuestsCompleted(progressFor(all.slice(0, 19).map((q) => q.id)))).toBe(
      false,
    );
    expect(allQuestsCompleted(progressFor(all.map((q) => q.id)))).toBe(true);
  });

  it("counts multi-tier completions once per dhikr", () => {
    const progress = progressFor([
      "alhamdulillah-33",
      "alhamdulillah-100",
      "subhanallah-33",
    ]);
    expect(completedDhikrCount(progress)).toBe(2);
  });
});

describe("pickDailyAmal", () => {
  const quest = (id: string, dhikrId: string, target: number): Quest => ({
    id,
    dhikrId,
    target,
  });
  const catalog = [
    quest("alhamdulillah-33", "alhamdulillah", 33),
    quest("alhamdulillah-100", "alhamdulillah", 100),
    quest("subhanallah-33", "subhanallah", 33),
    quest("astaghfirullah-100", "astaghfirullah", 100),
  ];

  it("returns null with nothing completed", () => {
    expect(pickDailyAmal([], at(2026, 3, 10))).toBeNull();
  });

  it("is stable within a day", () => {
    const morning = at(2026, 3, 10, 6);
    const night = at(2026, 3, 10, 23);
    expect(pickDailyAmal(catalog, morning)?.id).toBe(
      pickDailyAmal(catalog, night)?.id,
    );
  });

  it("suggests the smallest completed tier of the picked dhikr", () => {
    const only = [catalog[0], catalog[1]];
    expect(pickDailyAmal(only, at(2026, 3, 10))?.target).toBe(33);
  });

  it("rotates across days and covers every completed dhikr", () => {
    const picks = new Set<string>();
    for (let day = 1; day <= 6; day += 1) {
      const pick = pickDailyAmal(catalog, at(2026, 3, day));
      if (pick) picks.add(pick.dhikrId);
    }
    expect(picks).toEqual(new Set(["alhamdulillah", "subhanallah", "astaghfirullah"]));
  });
});
