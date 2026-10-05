import { db, type ProgressEvent, type QuestProgress } from "./db";

export type { ProgressEvent, ProgressEventType, QuestProgress } from "./db";

const newId = (): string => {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    throw new Error("crypto.randomUUID is unavailable; a secure context is required");
  }
  return crypto.randomUUID();
};

/** Appends an event and refreshes the derived progress cache, atomically. */
async function appendEvent(event: Omit<ProgressEvent, "id">): Promise<ProgressEvent> {
  const full: ProgressEvent = { id: newId(), ...event };
  await db.transaction("rw", db.events, db.questProgress, async () => {
    await db.events.add(full);
    await recomputeProgress(full.questId);
  });
  return full;
}

export const recordIncrement = (questId: string): Promise<ProgressEvent> =>
  appendEvent({ type: "increment", questId, delta: 1, at: Date.now(), synced: 0 });

export const recordUndo = (questId: string): Promise<ProgressEvent> =>
  appendEvent({ type: "undo", questId, delta: -1, at: Date.now(), synced: 0 });

export const recordQuestStarted = (questId: string): Promise<ProgressEvent> =>
  appendEvent({ type: "quest_started", questId, delta: 0, at: Date.now(), synced: 0 });

/** Records completion at most once per quest; repeats are no-ops. */
export async function recordQuestCompleted(questId: string): Promise<void> {
  await db.transaction("rw", db.events, db.questProgress, async () => {
    const already = await db.events
      .where("questId")
      .equals(questId)
      .and((event) => event.type === "quest_completed")
      .first();
    if (already) return;
    await db.events.add({
      id: newId(),
      type: "quest_completed",
      questId,
      delta: 0,
      at: Date.now(),
      synced: 0,
    });
    await recomputeProgress(questId);
  });
}

/**
 * Rebuilds one quest's derived progress from the event log, which is the
 * source of truth. Safe to call inside an existing write transaction.
 */
export async function recomputeProgress(questId: string): Promise<QuestProgress> {
  const events = await db.events.where("questId").equals(questId).toArray();
  const count = events.reduce((sum, event) => sum + event.delta, 0);
  const byTime = (a: ProgressEvent, b: ProgressEvent) => a.at - b.at;
  const completed = events.filter((e) => e.type === "quest_completed").sort(byTime)[0];
  const started = events.filter((e) => e.type === "quest_started").sort(byTime)[0];
  const progress: QuestProgress = {
    questId,
    count,
    startedAt: started?.at,
    completedAt: completed?.at,
    updatedAt: Date.now(),
  };
  await db.questProgress.put(progress);
  return progress;
}

export const getProgress = (questId: string): Promise<QuestProgress | undefined> =>
  db.questProgress.get(questId);

export async function getAllProgress(): Promise<Map<string, QuestProgress>> {
  const rows = await db.questProgress.toArray();
  return new Map(rows.map((row) => [row.questId, row]));
}

/** Net event deltas since dayStart (home screen "today" line), never negative. */
export async function getTodayTotal(dayStart: number): Promise<number> {
  const events = await db.events.where("at").aboveOrEqual(dayStart).toArray();
  const total = events.reduce((sum, event) => sum + event.delta, 0);
  // An undo may correct a count made before day start; today's own
  // total still cannot meaningfully go below zero.
  return Math.max(0, total);
}

export const getUnsyncedEvents = (): Promise<ProgressEvent[]> =>
  db.events.where("synced").equals(0).toArray();

/** Returns the number of events flipped to synced. */
export const markEventsSynced = (ids: string[]): Promise<number> =>
  db.events.where("id").anyOf(ids).modify({ synced: 1 });

/** Recomputes the derived cache for every quest that has events. */
export async function recomputeAllQuests(): Promise<void> {
  const questIds = await db.events.orderBy("questId").uniqueKeys();
  for (const questId of questIds) {
    await recomputeProgress(String(questId));
  }
}

/** Epoch ms of the earliest event, for the Journey "days practiced" stat. */
export async function getFirstEventAt(): Promise<number | undefined> {
  const first = await db.events.orderBy("at").first();
  return first?.at;
}
