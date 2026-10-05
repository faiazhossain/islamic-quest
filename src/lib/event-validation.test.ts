import { describe, expect, it } from "vitest";
import { MAX_AGE_MS, parseEvents } from "./event-validation";

const NOW = 1_800_000_000_000;

const valid = {
  id: "e1",
  type: "increment",
  questId: "astaghfirullah-100",
  delta: 1,
  at: NOW - 1000,
};

describe("parseEvents", () => {
  it("accepts a valid batch", () => {
    expect(parseEvents([valid], NOW)).toEqual([valid]);
  });

  it("rejects non-arrays and oversized batches", () => {
    expect(parseEvents(null, NOW)).toBeNull();
    expect(parseEvents({}, NOW)).toBeNull();
    expect(
      parseEvents(Array.from({ length: 2001 }, () => valid), NOW),
    ).toBeNull();
  });

  it("rejects unknown types, unknown quests, and out-of-range deltas", () => {
    expect(parseEvents([{ ...valid, type: "reset" }], NOW)).toBeNull();
    expect(parseEvents([{ ...valid, questId: "not-a-quest" }], NOW)).toBeNull();
    expect(parseEvents([{ ...valid, delta: 5 }], NOW)).toBeNull();
  });

  it("rejects ids that are missing or oversized", () => {
    expect(parseEvents([{ ...valid, id: "" }], NOW)).toBeNull();
    expect(parseEvents([{ ...valid, id: "x".repeat(65) }], NOW)).toBeNull();
  });

  it("rejects timestamps outside the accepted window", () => {
    expect(parseEvents([{ ...valid, at: NOW - MAX_AGE_MS - 1 }], NOW)).toBeNull();
    expect(parseEvents([{ ...valid, at: NOW + 6 * 60_000 }], NOW)).toBeNull();
  });

  it("accepts old-but-in-window history so restored backups never wedge sync", () => {
    const yearOld = NOW - 365 * 86_400_000;
    expect(parseEvents([{ ...valid, at: yearOld }], NOW)).toEqual([
      { ...valid, at: yearOld },
    ]);
  });

  it("rejects the whole batch when a single event fails", () => {
    expect(parseEvents([valid, { ...valid, id: "e2", delta: 9 }], NOW)).toBeNull();
  });
});
