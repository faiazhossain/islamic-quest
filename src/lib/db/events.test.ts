import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import { dayStartOf } from "../format";
import {
  getAllProgress,
  getPracticeEvents,
  getProgress,
  getQuestDeltaSince,
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

describe("practice after completion", () => {
  it("accumulates without duplicating the milestone", async () => {
    await recordIncrement("q1");
    await recordIncrement("q1");
    await recordQuestCompleted("q1");
    const firstCompletionAt = (await getProgress("q1"))?.completedAt;

    await recordIncrement("q1");
    await recordIncrement("q1");
    await recordQuestCompleted("q1");

    const completions = await db.events
      .where("questId")
      .equals("q1")
      .and((event) => event.type === "quest_completed")
      .toArray();

    expect(completions).toHaveLength(1);
    expect((await getProgress("q1"))?.count).toBe(4);
    expect((await getProgress("q1"))?.completedAt).toBe(firstCompletionAt);
  });

  it("keeps the original completion date when the cache is rebuilt", async () => {
    await recordIncrement("q1");
    await recordQuestCompleted("q1");
    const original = (await getProgress("q1"))?.completedAt;

    await recordIncrement("q1");
    const rebuilt = await recomputeProgress("q1");

    expect(rebuilt.completedAt).toBe(original);
  });

  describe("getQuestDeltaSince", () => {
    it("sums only that quest's events since day start", async () => {
      const dayStart = dayStartOf(Date.now());
      const today = dayStart + 60_000;
      await db.events.bulkAdd([
        { id: "y1", type: "increment", questId: "q1", delta: 1, at: dayStart - 3_600_000, synced: 1 },
        { id: "t1", type: "increment", questId: "q1", delta: 1, at: today, synced: 0 },
        { id: "t2", type: "increment", questId: "q1", delta: 1, at: today + 1, synced: 0 },
        { id: "t3", type: "increment", questId: "q2", delta: 1, at: today + 2, synced: 0 },
      ]);

      expect(await getQuestDeltaSince("q1", dayStart)).toBe(2);
    });

    it("clamps a day-boundary undo at zero", async () => {
      const dayStart = dayStartOf(Date.now());
      await db.events.bulkAdd([
        { id: "y1", type: "increment", questId: "q1", delta: 1, at: dayStart - 3_600_000, synced: 1 },
        { id: "t1", type: "undo", questId: "q1", delta: -1, at: dayStart + 60_000, synced: 0 },
      ]);

      expect(await getQuestDeltaSince("q1", dayStart)).toBe(0);
    });
  });

  it("projects events for the practice stats", async () => {
    await recordIncrement("q1");
    await recordUndo("q1");

    const projection = await getPracticeEvents();
    expect(projection).toHaveLength(2);
    expect(Object.keys(projection[0]).sort()).toEqual(["at", "delta", "questId"]);
    expect(projection.map((event) => event.delta).sort()).toEqual([-1, 1]);
  });
});
