import { QUESTS } from "./content";
import type { ProgressEventType } from "./db/db";
import type { SyncEvent } from "./sync-merge";

/**
 * The sync event contract, shared by the server route and the local
 * import flow. One definition here means an event that passes import is
 * guaranteed to pass the server, and vice versa - a malformed row can
 * never wedge sync into a permanent 400.
 */
export const KNOWN_QUEST_IDS: ReadonlySet<string> = new Set(
  QUESTS.map((quest) => quest.id),
);

const KNOWN_TYPES: readonly ProgressEventType[] = [
  "quest_started",
  "increment",
  "undo",
  "quest_completed",
];

export const MAX_BATCH = 2000;
export const CLOCK_SKEW_MS = 5 * 60_000;

/**
 * Bounds how far back a pushed event timestamp may reach. Set generously
 * (10 years): a user restoring a year-old backup must not have their
 * sync rejected wholesale - the bound exists to cap abuse, not to
 * expire real history.
 */
export const MAX_AGE_MS = 3650 * 86_400_000;

/** Validates one raw event against the sync contract. */
export function isValidEvent(candidate: unknown, now: number): candidate is SyncEvent {
  if (typeof candidate !== "object" || candidate === null) return false;
  const event = candidate as Record<string, unknown>;
  if (typeof event.id !== "string" || event.id.length === 0 || event.id.length > 64) {
    return false;
  }
  if (!KNOWN_TYPES.includes(event.type as ProgressEventType)) return false;
  if (typeof event.questId !== "string" || !KNOWN_QUEST_IDS.has(event.questId)) {
    return false;
  }
  if (event.delta !== -1 && event.delta !== 0 && event.delta !== 1) return false;
  if (
    typeof event.at !== "number" ||
    !Number.isFinite(event.at) ||
    event.at < now - MAX_AGE_MS ||
    event.at > now + CLOCK_SKEW_MS
  ) {
    return false;
  }
  return true;
}

/**
 * Parses a raw events array. Returns null when the batch shape itself is
 * invalid or any single event fails validation - the same all-or-nothing
 * rule the server applies, so both sides accept exactly the same input.
 */
export function parseEvents(raw: unknown, now: number = Date.now()): SyncEvent[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_BATCH) return null;
  const events: SyncEvent[] = [];
  for (const item of raw) {
    if (!isValidEvent(item, now)) return null;
    events.push({
      id: item.id,
      // isValidEvent narrowed the value; the cast records it.
      type: item.type,
      questId: item.questId,
      delta: item.delta,
      at: item.at,
    });
  }
  return events;
}
