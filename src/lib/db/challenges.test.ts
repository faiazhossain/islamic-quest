import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import {
  createStrictChallenge,
  deleteStrictChallenge,
  getLatestStrictChallenge,
  listStrictChallenges,
} from "./challenges";

beforeEach(async () => {
  await db.challenges.clear();
});

describe("strict challenge store", () => {
  it("creates, lists, and returns the latest challenge", async () => {
    const first = await createStrictChallenge({
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 30,
      now: 1_000,
    });
    const second = await createStrictChallenge({
      dhikrId: "astaghfirullah",
      dailyTarget: 500,
      durationDays: 7,
      now: 2_000,
    });

    const all = await listStrictChallenges();
    expect(all.map((challenge) => challenge.id)).toEqual([
      first.id,
      second.id,
    ]);
    expect((await getLatestStrictChallenge())?.id).toBe(second.id);
  });

  it("returns undefined with no challenges", async () => {
    expect(await getLatestStrictChallenge()).toBeUndefined();
    expect(await listStrictChallenges()).toEqual([]);
  });

  it("stamps the start day key from the creation time", async () => {
    // Local noon on 2026-03-03.
    const challenge = await createStrictChallenge({
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 7,
      now: new Date(2026, 2, 3, 12).getTime(),
    });
    expect(challenge.startDayKey).toBe("2026-03-03");
  });

  it("deletes a challenge", async () => {
    const challenge = await createStrictChallenge({
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 7,
      now: 1_000,
    });
    await deleteStrictChallenge(challenge.id);
    expect(await getLatestStrictChallenge()).toBeUndefined();
  });
});
