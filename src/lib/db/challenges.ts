import { db } from "./db";
import type { StrictChallenge } from "./db";
import { newId } from "./events";
import { localDayKey } from "../format";
import { streamIdFor } from "../challenge";

/**
 * Simple Challenge definitions live in their own local-first store.
 * Counts are ordinary events (see challenge.ts); this store holds only
 * the commitments. Several challenges may run at once - each is fully
 * independent, and every new row gets its own event stream at creation.
 * A multi-amal Challenge is one commitment carried by several rows that
 * share a groupId (see challenge.ts grouping).
 */

export async function createStrictChallenge(input: {
  dhikrId: string;
  dailyTarget: number;
  durationDays: number;
  now: number;
}): Promise<StrictChallenge> {
  const id = newId();
  const challenge: StrictChallenge = {
    id,
    dhikrId: input.dhikrId,
    dailyTarget: input.dailyTarget,
    durationDays: input.durationDays,
    startDayKey: localDayKey(input.now),
    createdAt: input.now,
    streamId: streamIdFor(id),
  };
  await db.challenges.add(challenge);
  return challenge;
}

/**
 * Creates one commitment from a setup: one row per amal, all sharing a
 * groupId and the same window, each counting into its own stream. A
 * single-amal setup still gets a groupId - the group is the Challenge.
 */
export async function createStrictChallenges(
  amals: ReadonlyArray<{ dhikrId: string; dailyTarget: number }>,
  input: { durationDays: number; now: number },
): Promise<StrictChallenge[]> {
  const groupId = newId();
  const startDayKey = localDayKey(input.now);
  const rows = amals.map((amal, index) => {
    const id = newId();
    return {
      id,
      dhikrId: amal.dhikrId,
      dailyTarget: amal.dailyTarget,
      durationDays: input.durationDays,
      startDayKey,
      createdAt: input.now + index,
      streamId: streamIdFor(id),
      groupId,
    } satisfies StrictChallenge;
  });
  await db.transaction("rw", db.challenges, async () => {
    await db.challenges.bulkAdd(rows);
  });
  return rows;
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

/** Deletes every row of a multi-amal commitment in one transaction. */
export async function deleteStrictChallenges(ids: readonly string[]): Promise<void> {
  await db.transaction("rw", db.challenges, async () => {
    await db.challenges.bulkDelete([...ids]);
  });
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
