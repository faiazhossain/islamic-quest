import { describe, expect, it } from "vitest";
import { publicQuests } from "./content";
import { trackQuests } from "./content/journey";
import { dayStartOf } from "./format";
import { selectHomeView, type HomeView } from "./home";
import type { PracticeEvent } from "./practice";
import type { QuestProgress } from "./db/db";

const NOW = new Date(2026, 3, 10, 9, 30, 0, 0).getTime();
const TODAY = dayStartOf(NOW);
const YESTERDAY = TODAY - 12 * 60 * 60 * 1000;

const entry = (
  questId: string,
  fields: Partial<QuestProgress> = {},
): [string, QuestProgress] => [
  questId,
  {
    questId,
    count: fields.count ?? 0,
    startedAt: fields.startedAt,
    completedAt: fields.completedAt,
    updatedAt: fields.updatedAt ?? 0,
  },
];

const event = (questId: string, delta: number, atMs: number): PracticeEvent => ({
  questId,
  delta,
  at: atMs,
});

const expectKind = (view: HomeView, kind: HomeView["kind"]): void => {
  expect(view.kind).toBe(kind);
};

describe("selectHomeView", () => {
  it("shows the first-visit state with the track's first quest suggested", () => {
    const view = selectHomeView({ progress: new Map(), events: [], now: NOW });
    expectKind(view, "first-visit");
    if (view.kind !== "first-visit") throw new Error("expected first-visit");
    expect(view.questId).toBe(trackQuests()[0].id);
    expect(view.target).toBe(trackQuests()[0].target);
    expect(view.name.length).toBeGreaterThan(0);
  });

  it("shows the most recently updated active quest", () => {
    const all = publicQuests();
    const progress = new Map([
      entry(all[0].id, { count: 5, startedAt: 1, updatedAt: 100 }),
      entry(all[1].id, { count: 9, startedAt: 2, updatedAt: 200 }),
      entry(all[2].id, { count: 3, completedAt: 50, updatedAt: 300 }),
    ]);
    const view = selectHomeView({ progress, events: [], now: NOW });
    if (view.kind !== "active-quest") throw new Error("expected active-quest");
    expect(view.questId).toBe(all[1].id);
    expect(view.count).toBe(9);
    expect(view.target).toBe(all[1].target);
  });

  it("shows the next-quest state when quests remain and none is active", () => {
    const all = publicQuests();
    const progress = new Map(
      all.slice(0, 16).map((quest) =>
        entry(quest.id, { count: 1, completedAt: 50, updatedAt: 50 }),
      ),
    );
    const view = selectHomeView({
      progress,
      events: [event(all[0].id, 7, TODAY + 60_000)],
      now: NOW,
    });
    if (view.kind !== "next-quest") throw new Error("expected next-quest");
    expect(view.todayTotal).toBe(7);
    // The suggestion follows track order, not catalog order.
    const expected = trackQuests().find(
      (quest) => !progress.get(quest.id)?.completedAt,
    );
    expect(view.questId).toBe(expected?.id);
  });

  it("keeps next-quest until one quest is left", () => {
    const all = publicQuests();
    const progress = new Map(
      all.slice(0, all.length - 1).map((quest) =>
        entry(quest.id, { count: 1, completedAt: 50, updatedAt: 50 }),
      ),
    );
    expectKind(selectHomeView({ progress, events: [], now: NOW }), "next-quest");
  });

  it("transitions to the lifelong-practice state when every quest is complete", () => {
    const all = publicQuests();
    const progress = new Map(
      all.map((quest) =>
        entry(quest.id, { count: 1, completedAt: 50, updatedAt: 50 }),
      ),
    );
    const view = selectHomeView({ progress, events: [], now: NOW });
    if (view.kind !== "all-complete") throw new Error("expected all-complete");
    expect(view.completedCount).toBe(all.length);
    expect(view.questTotal).toBe(all.length);
    expect(all.some((quest) => quest.id === view.daily.questId)).toBe(true);
    expect(view.daily.todayCount).toBe(0);
    expect(view.stats.daysPracticed).toBe(0);
  });

  it("keeps every challenge stream out of the quest-labeled total", () => {
    const all = publicQuests();
    const progress = new Map([
      ...all.map((quest) =>
        entry(quest.id, { count: 2, completedAt: 50, updatedAt: 50 }),
      ),
      entry("strict-challenge", { count: 500, updatedAt: 60 }),
      entry("strict-challenge:c1", { count: 40, updatedAt: 60 }),
    ]);
    const view = selectHomeView({ progress, events: [], now: NOW });
    if (view.kind !== "all-complete") throw new Error("expected all-complete");
    expect(view.totalDhikr).toBe(all.length * 2);
  });

  it("derives the daily quest's count from today's events only", () => {
    const all = publicQuests();
    const progress = new Map(
      all.map((quest) =>
        entry(quest.id, { count: 40, completedAt: 50, updatedAt: 50 }),
      ),
    );
    const dailyId = selectHomeView({ progress, events: [], now: NOW });
    if (dailyId.kind !== "all-complete") throw new Error("expected all-complete");
    const questId = dailyId.daily.questId;

    const events = [
      event(questId, 1, YESTERDAY),
      event(questId, 1, YESTERDAY),
      event(questId, 1, TODAY + 60_000),
      event(questId, 1, TODAY + 120_000),
      event(questId, -1, TODAY + 180_000),
      event("other-quest", 9, TODAY + 60_000),
    ];
    const view = selectHomeView({ progress, events, now: NOW });
    if (view.kind !== "all-complete") throw new Error("expected all-complete");
    // Yesterday's taps stay in the lifetime count; today nets to 1 and a
    // sibling quest's taps do not leak into the daily suggestion.
    expect(view.daily.todayCount).toBe(1);
    expect(view.todayTotal).toBe(10);
  });

  it("never lets today's total go negative", () => {
    const all = publicQuests();
    const progress = new Map(
      all.map((quest) =>
        entry(quest.id, { count: 1, completedAt: 50, updatedAt: 50 }),
      ),
    );
    const events = [event(all[0].id, -1, TODAY + 60_000)];
    const view = selectHomeView({ progress, events, now: NOW });
    if (view.kind !== "all-complete") throw new Error("expected all-complete");
    expect(view.todayTotal).toBe(0);
    expect(view.daily.todayCount).toBe(0);
  });
});
