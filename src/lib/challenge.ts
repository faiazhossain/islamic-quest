/**
 * Pure derivations for the Strict Challenge: one amal, one daily target,
 * one duration. Counts live in the append-only event log under the
 * reserved strict-challenge quest id; the persisted challenge row is only
 * the commitment itself. Everything here rebuilds from the event log
 * alone - status is derived, never stored, so a restored backup or a
 * synced device reconstructs the same truth.
 *
 * Strictness is the feature: a day counts only when its net count reaches
 * the daily target, and one missed day ends the challenge. The UI must
 * present that calmly, never punitively.
 */
import type { StrictChallenge } from "./db/db";
import { dayKeyOrdinal, dayStartOf, localDayKey } from "./format";
import type { PracticeEvent } from "./practice";

/**
 * Challenge counts ride the ordinary increment/undo event stream under
 * this reserved, non-catalog quest id (accepted by event-validation), so
 * challenge taps stay fully separate from quest progress.
 */
export const STRICT_CHALLENGE_QUEST_ID = "strict-challenge";

export const MIN_CHALLENGE_TARGET = 1;
export const MAX_CHALLENGE_TARGET = 10_000;
export const MIN_CHALLENGE_DAYS = 1;
export const MAX_CHALLENGE_DAYS = 365;

/** Product presets; 30 days is the recommended commitment. */
export const CHALLENGE_TARGET_PRESETS = [100, 500] as const;
export const CHALLENGE_DURATION_PRESETS = [7, 30, 40] as const;
export const RECOMMENDED_DURATION_DAYS = 30;

export type StrictStatus = "active" | "complete" | "broken";

export interface DerivedStrictChallenge {
  status: StrictStatus;
  /** 1-based day inside the window; 0 before the start date. */
  dayNumber: number;
  /** Consecutive completed days from day 1; a break ends the count. */
  streakDays: number;
  completedDays: number;
  todayCount: number;
  todayComplete: boolean;
  /** First day key that missed its target - carried only while broken. */
  missedDayKey: string | null;
}

const DAY_MS = 86_400_000;

const pad2 = (value: number): string => String(value).padStart(2, "0");

/**
 * Inverse of dayKeyOrdinal (which anchors on UTC noon, so consecutive
 * calendar keys stay consecutive ordinals across DST).
 */
function dayKeyFromOrdinal(ordinal: number): string {
  const date = new Date(ordinal * DAY_MS);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function isValidChallenge(challenge: StrictChallenge): boolean {
  return (
    challenge.dailyTarget >= MIN_CHALLENGE_TARGET &&
    challenge.dailyTarget <= MAX_CHALLENGE_TARGET &&
    challenge.durationDays >= MIN_CHALLENGE_DAYS &&
    challenge.durationDays <= MAX_CHALLENGE_DAYS
  );
}

/**
 * Derives the full challenge state from the event log. Days are local
 * calendar keys; a day's net count is clamped at zero so stray undo
 * history can never read as practice.
 */
export function deriveStrictChallenge(
  challenge: StrictChallenge,
  events: ReadonlyArray<PracticeEvent>,
  now: number,
): DerivedStrictChallenge {
  const strictEvents = events.filter(
    (event) => event.questId === STRICT_CHALLENGE_QUEST_ID,
  );

  const dayTotals = new Map<string, number>();
  for (const event of strictEvents) {
    const key = localDayKey(event.at);
    dayTotals.set(key, (dayTotals.get(key) ?? 0) + event.delta);
  }

  const startOrdinal = dayKeyOrdinal(challenge.startDayKey);
  const todayOrdinal = dayKeyOrdinal(localDayKey(now));

  let missedDayKey: string | null = null;
  let streakDays = 0;
  let completedDays = 0;
  for (let index = 0; index < challenge.durationDays; index += 1) {
    const key = dayKeyFromOrdinal(startOrdinal + index);
    const count = Math.max(0, dayTotals.get(key) ?? 0);
    const complete = count >= challenge.dailyTarget;
    if (complete) {
      completedDays += 1;
      if (missedDayKey === null) streakDays += 1;
    } else if (missedDayKey === null) {
      // Only a day that is already over can be missed - future days in
      // the window are simply still ahead of the user.
      if (startOrdinal + index < todayOrdinal) missedDayKey = key;
    }
  }

  const todayCount = Math.max(
    0,
    strictEvents.reduce(
      (sum, event) => (event.at >= dayStartOf(now) ? sum + event.delta : sum),
      0,
    ),
  );

  const status: StrictStatus =
    missedDayKey !== null
      ? "broken"
      : completedDays === challenge.durationDays
        ? "complete"
        : "active";

  return {
    status,
    dayNumber: Math.max(0, Math.min(todayOrdinal - startOrdinal + 1, challenge.durationDays)),
    streakDays,
    completedDays,
    todayCount,
    todayComplete: todayCount >= challenge.dailyTarget,
    missedDayKey,
  };
}

/**
 * Terminal check for the one-active-at-a-time rule: only a challenge
 * whose window is still live and unbroken blocks creating another.
 */
export function isActiveChallenge(derived: DerivedStrictChallenge): boolean {
  return derived.status === "active" || derived.status === "complete";
}

/**
 * The strictTodayCount selector, shared with Home: today's net count for
 * the challenge, independent of any quest progress.
 */
export function strictTodayCount(
  events: ReadonlyArray<PracticeEvent>,
  now: number,
): number {
  return Math.max(
    0,
    events.reduce(
      (sum, event) =>
        event.questId === STRICT_CHALLENGE_QUEST_ID && event.at >= dayStartOf(now)
          ? sum + event.delta
          : sum,
      0,
    ),
  );
}
