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

/**
 * The delta each event type may carry; every client producer writes exactly
 * these pairs (src/lib/db/events.ts). Cross-validating type and delta keeps
 * a hand-crafted API client from writing integrity-breaking rows like
 * "undo" with delta 1, which would inflate the rebuilt counts.
 */
const TYPE_DELTAS: Readonly<Record<ProgressEventType, readonly number[]>> = {
  quest_started: [0],
  increment: [1],
  undo: [-1],
  quest_completed: [0],
};

export const MAX_BATCH = 2000;
export const CLOCK_SKEW_MS = 5 * 60_000;

/**
 * Server-side ceiling on one user's stored event rows. This is an abuse
 * cap, not a real limit: 100k events is roughly 270 counts every day for a
 * year, far beyond genuine practice, so hitting it means something is
 * writing rows that are not real worship. Enforced in POST /api/sync.
 */
export const MAX_USER_EVENTS = 100_000;

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
  // Membership test against a numbers-only list; the cast is the check.
  if (!TYPE_DELTAS[event.type as ProgressEventType].includes(event.delta as number)) {
    return false;
  }
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

/**
 * A backup file must never exceed this size before it is read and parsed.
 * A legitimate export holds at most MAX_BATCH events, well under 1 MB, so
 * anything larger cannot pass validation anyway - rejecting it up front
 * keeps a bloated or hostile file from being read into memory at all.
 */
export const MAX_IMPORT_BYTES = 10_000_000;

/** The export envelope written by the settings screen. */
export interface ImportEnvelope {
  events: SyncEvent[];
}

/**
 * Validates the export envelope (app marker and version) before any event
 * is examined. Returns null unless the file is exactly the format this
 * version writes, so an unrecognized future export is rejected with a clear
 * message instead of half-imported.
 */
export function parseImportEnvelope(data: unknown): ImportEnvelope | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  if (record.app !== "amalyn" || record.version !== 1) return null;
  const events = parseEvents(record.events);
  return events === null ? null : { events };
}
