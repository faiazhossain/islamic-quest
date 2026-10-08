import { db } from "./db";
import type { StrictChallenge } from "./db";
import { newId } from "./events";
import { localDayKey } from "../format";

/**
 * Strict Challenge definitions live in their own local-first store.
 * Counts are ordinary events (see challenge.ts); this store holds only
 * the commitment. One active challenge at a time is enforced at creation:
 * callers derive the latest challenge first and only offer creation when
 * no live commitment exists.
 */

export async function createStrictChallenge(input: {
  dhikrId: string;
  dailyTarget: number;
  durationDays: number;
  now: number;
}): Promise<StrictChallenge> {
  const challenge: StrictChallenge = {
    id: newId(),
    dhikrId: input.dhikrId,
    dailyTarget: input.dailyTarget,
    durationDays: input.durationDays,
    startDayKey: localDayKey(input.now),
    createdAt: input.now,
  };
  await db.challenges.add(challenge);
  return challenge;
}

export async function getLatestStrictChallenge(): Promise<StrictChallenge | undefined> {
  const all = await listStrictChallenges();
  return all[all.length - 1];
}

export async function listStrictChallenges(): Promise<StrictChallenge[]> {
  // Sorted in JS, not via orderBy: the store indexes only `id`, and the
  // table holds at most a handful of rows.
  const all = await db.challenges.toArray();
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteStrictChallenge(id: string): Promise<void> {
  await db.challenges.delete(id);
}

/** Restores rows from a version-2 backup import, replacing local state. */
export async function restoreStrictChallenges(
  challenges: StrictChallenge[],
): Promise<void> {
  await db.transaction("rw", db.challenges, async () => {
    await db.challenges.clear();
    if (challenges.length > 0) await db.challenges.bulkAdd(challenges);
  });
}
