import { describe, expect, it } from "vitest";
import {
  MAX_AGE_MS,
  MAX_BATCH,
  MAX_IMPORT_BYTES,
  MAX_USER_EVENTS,
  parseEvents,
  parseImportEnvelope,
} from "./event-validation";

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

  it("accepts exactly the type/delta pairs the client produces", () => {
    const pairs = [
      { type: "quest_started", delta: 0 },
      { type: "increment", delta: 1 },
      { type: "undo", delta: -1 },
      { type: "quest_completed", delta: 0 },
    ] as const;
    for (const [index, pair] of pairs.entries()) {
      expect(
        parseEvents([{ ...valid, id: `e${index}`, ...pair }], NOW),
      ).toEqual([{ ...valid, id: `e${index}`, ...pair }]);
    }
  });

  it("rejects integrity-breaking type/delta pairs", () => {
    // An "undo" that adds, or a completion with a nonzero delta, would
    // corrupt the rebuilt counts; only the exact pairs are contractual.
    expect(parseEvents([{ ...valid, type: "undo", delta: 1 }], NOW)).toBeNull();
    expect(
      parseEvents([{ ...valid, type: "quest_completed", delta: -1 }], NOW),
    ).toBeNull();
    expect(
      parseEvents([{ ...valid, type: "quest_started", delta: 1 }], NOW),
    ).toBeNull();
    expect(parseEvents([{ ...valid, type: "increment", delta: 0 }], NOW)).toBeNull();
    expect(parseEvents([{ ...valid, type: "increment", delta: -1 }], NOW)).toBeNull();
  });
});

describe("parseImportEnvelope", () => {
  const envelope = (events: unknown) => ({ app: "amalyn", version: 1, events });

  // parseImportEnvelope validates against the real clock, so the sample
  // event must sit inside the accepted window.
  const freshEvent = { ...valid, at: Date.now() - 1000 };

  it("accepts a well-formed export and returns the parsed events", () => {
    const result = parseImportEnvelope(envelope([freshEvent]));
    expect(result).toEqual({ events: [freshEvent] });
  });

  it("rejects files that are not this app's version-1 export", () => {
    expect(parseImportEnvelope(null)).toBeNull();
    expect(parseImportEnvelope("export")).toBeNull();
    expect(parseImportEnvelope({ ...envelope([freshEvent]), app: "other" })).toBeNull();
    expect(parseImportEnvelope({ ...envelope([freshEvent]), version: 2 })).toBeNull();
    expect(
      parseImportEnvelope({ ...envelope([freshEvent]), version: "1" }),
    ).toBeNull();
    expect(parseImportEnvelope({ app: "amalyn", version: 1 })).toBeNull();
  });

  it("rejects envelopes whose events fail the sync contract", () => {
    expect(parseImportEnvelope(envelope([{ ...freshEvent, questId: "nope" }]))).toBeNull();
    expect(parseImportEnvelope(envelope("events"))).toBeNull();
  });

  it("leaves dangerous JSON keys inert", () => {
    // JSON.parse turns these into own properties; the parser must neither
    // merge nor trust them, and pollution must be impossible.
    const poisoned = JSON.parse(
      `{"app":"amalyn","version":1,"__proto__":{"polluted":true},"events":[${JSON.stringify({ ...freshEvent, constructor: {"prototype": {}}, prototype: {x: 1} })}]}`,
    ) as Record<string, unknown>;
    const result = parseImportEnvelope(poisoned);
    expect(result).not.toBeNull();
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
    // Only the five contractual fields survive into the parsed event.
    expect(Object.keys(result!.events[0]).sort()).toEqual([
      "at",
      "delta",
      "id",
      "questId",
      "type",
    ]);
  });

  it("keeps the abuse-cap constants reachable and ordered", () => {
    // Documented boundaries: import batches fit in one sync batch, and the
    // per-user server cap sits far above anything genuine practice produces.
    expect(MAX_IMPORT_BYTES).toBeGreaterThan(MAX_BATCH * 200);
    expect(MAX_USER_EVENTS).toBeGreaterThan(MAX_BATCH);
  });
});
