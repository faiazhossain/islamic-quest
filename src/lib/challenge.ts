/**
 * Pure derivations for the Simple Challenge: one amal, one daily target,
 * one duration. Several challenges can run at once; each counts into its
 * own append-only event stream, so their days never cross-contaminate.
 * The persisted challenge row is only the commitment itself. Everything
 * here rebuilds from the event log alone - status is derived, never
 * stored, so a restored backup or a synced device reconstructs the same
 * truth.
 *
 * Strictness is the feature: a day counts only when its net count reaches
 * the daily target, and one missed day ends the challenge. The UI must
 * present that calmly, never punitively.
 */
import type { QuestProgress, StrictChallenge } from "./db/db";
import { dayKeyOrdinal, dayStartOf, localDayKey } from "./format";
import type { PracticeEvent } from "./practice";

/**
 * Challenge counts ride ordinary increment/undo event streams under
 * reserved, non-catalog quest ids (accepted by event-validation), so
 * challenge taps stay fully separate from quest progress.
 */
export const STRICT_CHALLENGE_QUEST_ID = "strict-challenge";

/**
 * Each challenge counts into its own stream: "<reserved id>:<challenge id>".
 * The suffix charset matches the challenge-id validation in
 * event-validation.ts, so an event that passes import always passes the
 * server too.
 */
export const CHALLENGE_STREAM_PATTERN = /^strict-challenge:[A-Za-z0-9-]{1,64}$/;

export const streamIdFor = (challengeId: string): string =>
  `${STRICT_CHALLENGE_QUEST_ID}:${challengeId}`;

/** True for the legacy shared stream and every per-challenge stream. */
export const isChallengeStreamId = (questId: string): boolean =>
  questId === STRICT_CHALLENGE_QUEST_ID || CHALLENGE_STREAM_PATTERN.test(questId);

/** Resolves the event stream a challenge reads and writes. */
export const challengeStreamId = (challenge: StrictChallenge): string =>
  challenge.streamId ?? STRICT_CHALLENGE_QUEST_ID;

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
  const streamId = challengeStreamId(challenge);
  const strictEvents = events.filter((event) => event.questId === streamId);

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
 * True while a commitment is still live: an active window, or a finished
 * one the user has not yet restarted from.
 */
export function isActiveChallenge(derived: DerivedStrictChallenge): boolean {
  return derived.status === "active" || derived.status === "complete";
}

/**
 * Quest-labeled dhikr total: challenge counts (legacy shared stream and
 * every per-challenge stream) are worship but not quest progress, so
 * their rows stay out of this figure.
 */
export function sumQuestDhikr(
  progress: Iterable<QuestProgress>,
): number {
  let total = 0;
  for (const entry of progress) {
    if (!isChallengeStreamId(entry.questId)) total += entry.count;
  }
  return total;
}
