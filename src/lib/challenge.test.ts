import { describe, expect, it } from "vitest";
import {
  STRICT_CHALLENGE_QUEST_ID,
  challengeStreamId,
  deriveChallengeGroup,
  deriveStrictChallenge,
  groupStrictChallenges,
  isActiveChallenge,
  isChallengeStreamId,
  streamIdFor,
  sumQuestDhikr,
} from "./challenge";
import type { QuestProgress, StrictChallenge } from "./db/db";
import type { PracticeEvent } from "./practice";

/** Local noon on 2026-03-03 - day 3 of the fixture challenge. */
const NOW = new Date(2026, 2, 3, 12, 0, 0, 0).getTime();

const at = (
  month: number,
  day: number,
  hour: number,
  minute = 0,
): number => new Date(2026, month - 1, day, hour, minute, 0, 0).getTime();

const challenge = (overrides: Partial<StrictChallenge> = {}): StrictChallenge => ({
  id: "c1",
  dhikrId: "subhanallah",
  dailyTarget: 100,
  durationDays: 7,
  startDayKey: "2026-03-01",
  createdAt: 0,
  ...overrides,
});

const ev = (delta: number, when: number, questId = STRICT_CHALLENGE_QUEST_ID): PracticeEvent => ({
  questId,
  delta,
  at: when,
});

describe("deriveStrictChallenge", () => {
  it("is active on day 1 with nothing counted yet", () => {
    const derived = deriveStrictChallenge(
      challenge({ startDayKey: "2026-03-03" }),
      [],
      NOW,
    );
    expect(derived.status).toBe("active");
    expect(derived.dayNumber).toBe(1);
    expect(derived.streakDays).toBe(0);
    expect(derived.todayCount).toBe(0);
    expect(derived.todayComplete).toBe(false);
  });

  it("clamps the day number inside the window and before the start", () => {
    expect(deriveStrictChallenge(challenge(), [], at(3, 10, 9)).dayNumber).toBe(7);
    expect(deriveStrictChallenge(challenge(), [], at(3, 15, 9)).dayNumber).toBe(7);
    expect(
      deriveStrictChallenge(challenge({ startDayKey: "2026-03-05" }), [], NOW)
        .dayNumber,
    ).toBe(0);
  });

  it("counts a completed day toward the streak", () => {
    const events = [ev(100, at(3, 1, 9))];
    // Noon on day 2: day 1 is done, day 2 is still in progress.
    const derived = deriveStrictChallenge(challenge(), events, at(3, 2, 12));
    expect(derived.status).toBe("active");
    expect(derived.streakDays).toBe(1);
    expect(derived.completedDays).toBe(1);
  });

  it("never breaks on a future or current window day", () => {
    const events = [ev(100, at(3, 1, 9))];
    const day2Noon = at(3, 2, 12);
    const derived = deriveStrictChallenge(challenge(), events, day2Noon);
    expect(derived.status).toBe("active");
    expect(derived.dayNumber).toBe(2);
    expect(derived.todayComplete).toBe(false);
  });

  it("breaks on the first fully missed past day, calmly carrying its key", () => {
    const events = [ev(100, at(3, 1, 9))];
    const derived = deriveStrictChallenge(challenge(), events, NOW);
    expect(derived.status).toBe("broken");
    expect(derived.missedDayKey).toBe("2026-03-02");
    expect(derived.streakDays).toBe(1);
  });

  it("respects the day boundary: 23:59 is day 1, 00:01 is day 2", () => {
    const events = [ev(60, at(3, 1, 23, 59)), ev(60, at(3, 2, 0, 1))];
    const derived = deriveStrictChallenge(challenge(), events, NOW);
    expect(derived.status).toBe("broken");
    expect(derived.missedDayKey).toBe("2026-03-01");
  });

  it("nets undo history before judging a day", () => {
    const events = [ev(100, at(3, 1, 9)), ev(-30, at(3, 1, 20))];
    const derived = deriveStrictChallenge(challenge(), events, NOW);
    expect(derived.status).toBe("broken");
    expect(derived.missedDayKey).toBe("2026-03-01");
  });

  it("completes only when every window day reached the target", () => {
    const events = Array.from({ length: 7 }, (_, index) =>
      ev(100, at(3, index + 1, 9)),
    );
    const derived = deriveStrictChallenge(challenge(), events, at(3, 7, 12));
    expect(derived.status).toBe("complete");
    expect(derived.streakDays).toBe(7);
    expect(derived.completedDays).toBe(7);
    expect(isActiveChallenge(derived)).toBe(true);
  });

  it("ignores events outside the challenge stream", () => {
    const events = [
      ev(100, at(3, 1, 9), "subhanallah-100"),
      ev(100, at(3, 2, 9), "subhanallah-100"),
    ];
    const derived = deriveStrictChallenge(challenge(), events, NOW);
    expect(derived.status).toBe("broken"); // days 1-2 have no strict counts
    expect(derived.todayCount).toBe(0);
  });

  it("derives today's count from today's events only", () => {
    const events = [ev(40, at(3, 3, 8)), ev(60, at(3, 3, 11)), ev(90, at(3, 2, 9))];
    const derived = deriveStrictChallenge(challenge(), events, NOW);
    expect(derived.todayCount).toBe(100);
    expect(derived.todayComplete).toBe(true);
  });

  it("falls back to the legacy shared stream when streamId is absent", () => {
    expect(challengeStreamId(challenge())).toBe(STRICT_CHALLENGE_QUEST_ID);
    expect(challengeStreamId(challenge({ streamId: streamIdFor("c1") }))).toBe(
      streamIdFor("c1"),
    );
  });
});

describe("concurrent challenges", () => {
  const sameDay = (overrides: Partial<StrictChallenge>): StrictChallenge =>
    challenge({ startDayKey: "2026-03-03", ...overrides });

  it("keeps concurrent challenges' counts fully separate", () => {
    const one = sameDay({ id: "c1", streamId: streamIdFor("c1") });
    const two = sameDay({
      id: "c2",
      dhikrId: "alhamdulillah",
      dailyTarget: 500,
      streamId: streamIdFor("c2"),
    });
    const events = [
      ev(40, at(3, 3, 8), streamIdFor("c1")),
      ev(60, at(3, 3, 11), streamIdFor("c1")),
      ev(90, at(3, 3, 10), streamIdFor("c2")),
      // The legacy shared stream reaches neither new-stream challenge.
      ev(100, at(3, 3, 10), STRICT_CHALLENGE_QUEST_ID),
    ];
    const first = deriveStrictChallenge(one, events, NOW);
    expect(first.todayCount).toBe(100);
    expect(first.todayComplete).toBe(true);
    expect(first.status).toBe("active");
    const second = deriveStrictChallenge(two, events, NOW);
    expect(second.todayCount).toBe(90);
    expect(second.todayComplete).toBe(false);
    expect(second.status).toBe("active");
  });

  it("a missed day breaks only its own challenge", () => {
    const one = challenge({ id: "c1", streamId: streamIdFor("c1") });
    const two = challenge({
      id: "c2",
      dhikrId: "alhamdulillah",
      dailyTarget: 500,
      streamId: streamIdFor("c2"),
    });
    // Challenge one completed days 1-2; challenge two counted nothing.
    const events = [
      ev(100, at(3, 1, 9), streamIdFor("c1")),
      ev(100, at(3, 2, 9), streamIdFor("c1")),
    ];
    const first = deriveStrictChallenge(one, events, NOW);
    expect(first.status).toBe("active");
    expect(first.streakDays).toBe(2);
    const second = deriveStrictChallenge(two, events, NOW);
    expect(second.status).toBe("broken");
    expect(second.missedDayKey).toBe("2026-03-01");
    expect(second.streakDays).toBe(0);
  });
});

describe("groupStrictChallenges", () => {
  const sameDay = (overrides: Partial<StrictChallenge>): StrictChallenge =>
    challenge({ startDayKey: "2026-03-03", ...overrides });

  it("groups rows that share a groupId, oldest commitment first", () => {
    const a1 = sameDay({ id: "a1", groupId: "g1", createdAt: 10 });
    const a2 = sameDay({
      id: "a2",
      dhikrId: "alhamdulillah",
      groupId: "g1",
      createdAt: 11,
    });
    const b1 = sameDay({
      id: "b1",
      dhikrId: "subhanallahi-wa-bihamdihi",
      groupId: "g2",
      createdAt: 5,
    });
    const solo = sameDay({ id: "s1", createdAt: 20 });

    const groups = groupStrictChallenges([a1, b1, a2, solo]);
    expect(groups.map((group) => group.id)).toEqual(["g2", "g1", "s1"]);
    expect(groups[1].rows.map((row) => row.id)).toEqual(["a1", "a2"]);
    expect(groups[2].rows.map((row) => row.id)).toEqual(["s1"]);
  });

  it("keeps a legacy row without groupId as its own group", () => {
    const groups = groupStrictChallenges([challenge()]);
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("c1");
  });

  it("derives group status: any broken breaks, all complete finishes", () => {
    // Shared window 2026-03-01..07; NOW is 2026-03-03, so days 1-2 are
    // the judgeable past days.
    const m1 = challenge({ id: "m1", dailyTarget: 100 });
    const m2 = challenge({
      id: "m2",
      dhikrId: "alhamdulillah",
      dailyTarget: 50,
      streamId: streamIdFor("m2"),
    });
    const hitBothDays = (target: number, stream: string): PracticeEvent[] => [
      ev(target, at(3, 1, 9), stream),
      ev(target, at(3, 2, 9), stream),
    ];
    const group = {
      id: "g1",
      rows: [m1, m2],
      derived: [
        deriveStrictChallenge(m1, hitBothDays(100, STRICT_CHALLENGE_QUEST_ID), NOW),
        deriveStrictChallenge(m2, hitBothDays(50, streamIdFor("m2")), NOW),
      ],
    };
    expect(deriveChallengeGroup(group)).toBe("active");

    const missedOnce = {
      ...group,
      derived: [
        group.derived[0],
        // m2 counted nothing: day 1 missed, so the commitment is broken.
        deriveStrictChallenge(m2, [], NOW),
      ],
    };
    expect(deriveChallengeGroup(missedOnce)).toBe("broken");

    const f1 = challenge({ id: "f1" });
    const f2 = challenge({
      id: "f2",
      dhikrId: "alhamdulillah",
      streamId: streamIdFor("f2"),
    });
    const sevenDays = (target: number, stream: string): PracticeEvent[] =>
      Array.from({ length: 7 }, (_, index) => ev(target, at(3, index + 1, 9), stream));
    const finished = {
      id: "g2",
      rows: [f1, f2],
      derived: [
        deriveStrictChallenge(f1, sevenDays(100, STRICT_CHALLENGE_QUEST_ID), at(3, 8, 9)),
        deriveStrictChallenge(f2, sevenDays(100, streamIdFor("f2")), at(3, 8, 9)),
      ],
    };
    expect(deriveChallengeGroup(finished)).toBe("complete");
  });
});

describe("isChallengeStreamId", () => {
  it("accepts the legacy stream and well-formed per-challenge streams", () => {
    expect(isChallengeStreamId("strict-challenge")).toBe(true);
    expect(isChallengeStreamId(streamIdFor("c1"))).toBe(true);
    expect(isChallengeStreamId("strict-challenge:0123456789abcdef-xyz")).toBe(true);
  });

  it("rejects look-alikes and junk", () => {
    expect(isChallengeStreamId("strict-challenge:")).toBe(false);
    expect(isChallengeStreamId("strict-challenge:a b")).toBe(false);
    expect(isChallengeStreamId(`strict-challenge:${"x".repeat(65)}`)).toBe(false);
    expect(isChallengeStreamId("Strict-Challenge:c1")).toBe(false);
    expect(isChallengeStreamId("strict-challenge-extra:c1")).toBe(false);
    expect(isChallengeStreamId("subhanallah-100")).toBe(false);
  });
});

describe("sumQuestDhikr", () => {
  it("counts catalog rows and skips every challenge stream", () => {
    const rows: QuestProgress[] = [
      { questId: "subhanallah-100", count: 120, updatedAt: 0 },
      { questId: "alhamdulillah-33", count: 8, updatedAt: 0 },
      { questId: STRICT_CHALLENGE_QUEST_ID, count: 500, updatedAt: 0 },
      { questId: streamIdFor("c1"), count: 40, updatedAt: 0 },
      { questId: streamIdFor("c2"), count: 7, updatedAt: 0 },
    ];
    expect(sumQuestDhikr(rows)).toBe(128);
  });
});
