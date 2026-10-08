import { DHIKR, QUESTS } from "./content";
import {
  MAX_CHALLENGE_DAYS,
  MAX_CHALLENGE_TARGET,
  MIN_CHALLENGE_DAYS,
  MIN_CHALLENGE_TARGET,
  isChallengeStreamId,
  streamIdFor,
} from "./challenge";
import type { ProgressEventType } from "./db/db";
import type { SyncEvent } from "./sync-merge";

/**
 * The sync event contract, shared by the server route and the local
 * import flow. One definition here means an event that passes import is
 * guaranteed to pass the server, and vice versa - a malformed row can
 * never wedge sync into a permanent 400. Catalog quest ids are listed
 * here; challenge stream ids (the reserved shared id and each
 * challenge's own stream) are accepted by pattern via isChallengeStreamId.
 */
export const KNOWN_QUEST_IDS: ReadonlySet<string> = new Set([
  ...QUESTS.map((quest) => quest.id),
]);

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
  if (
    typeof event.questId !== "string" ||
    !(KNOWN_QUEST_IDS.has(event.questId) || isChallengeStreamId(event.questId))
  ) {
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
  /** Version-1 files carry none; restored as-is for the challenges store. */
  challenges: StrictChallengeBackup[];
}

const KNOWN_DHIKR_IDS: ReadonlySet<string> = new Set(
  DHIKR.map((dhikr) => dhikr.id),
);

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Challenge-id charset: deliberately identical to the stream-id suffix in
 * CHALLENGE_STREAM_PATTERN, so a challenge that passes this check can
 * never produce a stream id the event contract rejects.
 */
const CHALLENGE_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

/** A challenge definition as it travels inside a version-2 backup. */
export interface StrictChallengeBackup {
  id: string;
  dhikrId: string;
  dailyTarget: number;
  durationDays: number;
  startDayKey: string;
  createdAt: number;
  /** Canonical per-challenge stream; absent on pre-multi-challenge rows. */
  streamId?: string;
  /** Shared by rows of one multi-amal commitment; absent on solo rows. */
  groupId?: string;
}

/** Validates one raw challenge row; same all-or-nothing rule as events. */
function parseChallenge(raw: unknown): StrictChallengeBackup | null {
  if (typeof raw !== "object" || raw === null) return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || !CHALLENGE_ID_PATTERN.test(row.id)) {
    return null;
  }
  if (typeof row.dhikrId !== "string" || !KNOWN_DHIKR_IDS.has(row.dhikrId)) {
    return null;
  }
  const target = row.dailyTarget;
  if (
    typeof target !== "number" ||
    !Number.isInteger(target) ||
    target < MIN_CHALLENGE_TARGET ||
    target > MAX_CHALLENGE_TARGET
  ) {
    return null;
  }
  const days = row.durationDays;
  if (
    typeof days !== "number" ||
    !Number.isInteger(days) ||
    days < MIN_CHALLENGE_DAYS ||
    days > MAX_CHALLENGE_DAYS
  ) {
    return null;
  }
  if (
    typeof row.startDayKey !== "string" ||
    !DAY_KEY_PATTERN.test(row.startDayKey) ||
    Number.isNaN(
      new Date(`${row.startDayKey}T12:00:00`).getTime(),
    )
  ) {
    return null;
  }
  if (
    typeof row.createdAt !== "number" ||
    !Number.isFinite(row.createdAt)
  ) {
    return null;
  }
  // The stream id is canonical when present: a backup row may only point
  // at its own stream, never at another challenge's counts.
  let streamId: string | undefined;
  if (row.streamId !== undefined) {
    if (typeof row.streamId !== "string" || row.streamId !== streamIdFor(row.id)) {
      return null;
    }
    streamId = row.streamId;
  }
  // The group id only needs the same charset as the challenge id: it is
  // a label rows share, never a reference to another store.
  let groupId: string | undefined;
  if (row.groupId !== undefined) {
    if (typeof row.groupId !== "string" || !CHALLENGE_ID_PATTERN.test(row.groupId)) {
      return null;
    }
    groupId = row.groupId;
  }
  return {
    id: row.id,
    dhikrId: row.dhikrId,
    dailyTarget: target,
    durationDays: days,
    startDayKey: row.startDayKey,
    createdAt: row.createdAt,
    ...(streamId !== undefined ? { streamId } : {}),
    ...(groupId !== undefined ? { groupId } : {}),
  };
}

/**
 * Validates the export envelope (app marker and version) before any event
 * is examined. Returns null unless the file is exactly the format this
 * version writes, so an unrecognized future export is rejected with a clear
 * message instead of half-imported. Version 1 is today's events-only
 * export and stays importable forever; version 2 adds the local
 * Strict Challenge definitions.
 */
export function parseImportEnvelope(data: unknown): ImportEnvelope | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  if (record.app !== "amalyn") return null;
  if (record.version !== 1 && record.version !== 2) return null;
  const events = parseEvents(record.events);
  if (events === null) return null;
  let challenges: StrictChallengeBackup[] = [];
  if (record.version === 2) {
    if (!Array.isArray(record.challenges)) return null;
    challenges = [];
    for (const raw of record.challenges) {
      const challenge = parseChallenge(raw);
      if (challenge === null) return null;
      challenges.push(challenge);
    }
  }
  return { events, challenges };
}
