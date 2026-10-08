import { describe, expect, it } from "vitest";
import {
  STRICT_CHALLENGE_QUEST_ID,
  deriveStrictChallenge,
  isActiveChallenge,
  strictTodayCount,
} from "./challenge";
import type { StrictChallenge } from "./db/db";
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
    expect(strictTodayCount(events, NOW)).toBe(100);
    // Viewed from day 2, only day-2-and-later events sit in "today" - the
    // day-1 taps stay out.
    expect(strictTodayCount([ev(90, at(3, 2, 9)), ev(50, at(3, 1, 9))], at(3, 2, 12))).toBe(90);
  });
});
