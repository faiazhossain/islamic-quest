import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import {
  getAllProgress,
  getProgress,
  getTodayTotal,
  recordIncrement,
  recordQuestCompleted,
  recordQuestStarted,
  recordUndo,
  recomputeProgress,
} from "./events";

beforeEach(async () => {
  await Promise.all([db.events.clear(), db.questProgress.clear()]);
});

describe("event log", () => {
  it("accumulates increments into progress", async () => {
    await recordQuestStarted("q1");
    await recordIncrement("q1");
    await recordIncrement("q1");
    await recordIncrement("q1");

    const progress = await getProgress("q1");
    expect(progress?.count).toBe(3);
    expect(progress?.startedAt).toBeDefined();
  });

  it("undo subtracts from the count", async () => {
    await recordIncrement("q1");
    await recordIncrement("q1");
    await recordUndo("q1");

    expect((await getProgress("q1"))?.count).toBe(1);
  });

  it("records completion at most once", async () => {
    await recordQuestCompleted("q1");
    await recordQuestCompleted("q1");

    const completions = await db.events
      .where("questId")
      .equals("q1")
      .and((event) => event.type === "quest_completed")
      .toArray();

    expect(completions).toHaveLength(1);
    expect((await getProgress("q1"))?.completedAt).toBe(completions[0].at);
  });

  it("keeps quests isolated", async () => {
    await recordIncrement("a");
    await recordIncrement("a");
    await recordIncrement("b");

    const all = await getAllProgress();
    expect(all.get("a")?.count).toBe(2);
    expect(all.get("b")?.count).toBe(1);
  });

  it("rebuilds progress from events alone", async () => {
    await recordIncrement("q1");
    await recordIncrement("q1");
    await recordQuestCompleted("q1");

    await db.questProgress.clear();
    const rebuilt = await recomputeProgress("q1");

    expect(rebuilt.count).toBe(2);
    expect(rebuilt.completedAt).toBeDefined();
  });

  it("tags new events as unsynced", async () => {
    await recordIncrement("q1");

    const events = await db.events.toArray();
    expect(events).toHaveLength(1);
    expect(events[0].synced).toBe(0);
  });

  it("sums today's deltas from a day start timestamp", async () => {
    const now = Date.now();
    await recordIncrement("q1");
    await recordIncrement("q1");
    await recordUndo("q1");

    const total = await getTodayTotal(now - 60_000);
    expect(total).toBe(1);
  });

  it("never reports a negative total for today", async () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    await db.events.add({
      id: "old-1",
      type: "increment",
      questId: "q1",
      delta: 1,
      at: yesterday,
      synced: 1,
    });
    // Today's undo corrects yesterday's count; today still shows zero.
    await recordUndo("q1");

    const total = await getTodayTotal(Date.now() - 60_000);
    expect(total).toBe(0);
  });
});
