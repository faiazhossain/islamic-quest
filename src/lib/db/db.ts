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

export class AmalynDb extends Dexie {
  events!: EntityTable<ProgressEvent, "id">;
  questProgress!: EntityTable<QuestProgress, "questId">;

  constructor() {
    super("amalyn");
    this.version(1).stores({
      events: "id, questId, at, synced",
      questProgress: "questId",
    });
  }
}

export const db = new AmalynDb();
