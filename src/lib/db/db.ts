import Dexie, { type EntityTable } from "dexie";

/** Every user action that changes progress is an immutable, appendable event. */
export type ProgressEventType =
  | "quest_started"
  | "increment"
  | "undo"
  | "quest_completed";

export interface ProgressEvent {
  /** Client-generated uuid; doubles as the sync idempotency key. */
  id: string;
  type: ProgressEventType;
  questId: string;
  /** +1 increment, -1 undo, 0 for start/complete markers. */
  delta: number;
  /** Epoch milliseconds. */
  at: number;
  /** Flipped to 1 once the event reaches the server. Stored as 0/1 because booleans are not valid index keys. */
  synced: 0 | 1;
}

/** Derived cache, always rebuildable from the event log. */
export interface QuestProgress {
  questId: string;
  count: number;
  startedAt?: number;
  completedAt?: number;
  updatedAt: number;
}

/**
 * A Strict Challenge definition: one amal, one daily target, one duration.
 * Local-first by design - only its counts (increment/undo events under the
 * reserved strict-challenge quest id) sync; status is derived on read, so
 * the persisted row is just the commitment itself.
 */
export interface StrictChallenge {
  /** Client-generated uuid. */
  id: string;
  /** References the DHIKR catalog - never a duplicate of its data. */
  dhikrId: string;
  dailyTarget: number;
  durationDays: number;
  /** Local "YYYY-MM-DD" of day 1; derivation is DST-safe from this key. */
  startDayKey: string;
  createdAt: number;
}

export class AmalynDb extends Dexie {
  events!: EntityTable<ProgressEvent, "id">;
  questProgress!: EntityTable<QuestProgress, "questId">;
  challenges!: EntityTable<StrictChallenge, "id">;

  constructor() {
    super("amalyn");
    this.version(1).stores({
      events: "id, questId, at, synced",
      questProgress: "questId",
    });
    this.version(2).stores({
      challenges: "id",
    });
  }
}

export const db = new AmalynDb();
