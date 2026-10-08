import { describe, expect, it } from "vitest";
import { streamIdFor } from "./challenge";
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

  it("accepts the reserved daily-challenge stream like any quest", () => {
    const strict = { ...valid, questId: "strict-challenge" };
    expect(parseEvents([strict], NOW)).toEqual([strict]);
    expect(
      parseEvents([{ ...strict, type: "undo", delta: -1 }], NOW),
    ).toEqual([{ ...strict, type: "undo", delta: -1 }]);
  });

  it("accepts per-challenge stream ids like any quest", () => {
    const first = { ...valid, questId: streamIdFor("c1") };
    expect(parseEvents([first], NOW)).toEqual([first]);
    const undo = { ...first, type: "undo" as const, delta: -1 };
    expect(parseEvents([undo], NOW)).toEqual([undo]);
  });

  it("rejects malformed challenge stream ids", () => {
    for (const questId of [
      "strict-challenge:",
      "strict-challenge:a b",
      `strict-challenge:${"x".repeat(65)}`,
      "Strict-Challenge:c1",
      "strict-challenge-extra:c1",
      "challenge:c1",
    ]) {
      expect(parseEvents([{ ...valid, questId }], NOW)).toBeNull();
    }
  });

  it("keeps batches all-or-nothing on a bad stream id", () => {
    expect(
      parseEvents(
        [valid, { ...valid, id: "e2", questId: "strict-challenge:" }],
        NOW,
      ),
    ).toBeNull();
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
    expect(result).toEqual({ events: [freshEvent], challenges: [] });
  });

  it("rejects files that are not this app's version-1 or version-2 export", () => {
    expect(parseImportEnvelope(null)).toBeNull();
    expect(parseImportEnvelope("export")).toBeNull();
    expect(parseImportEnvelope({ ...envelope([freshEvent]), app: "other" })).toBeNull();
    expect(parseImportEnvelope({ ...envelope([freshEvent]), version: 3 })).toBeNull();
    expect(
      parseImportEnvelope({ ...envelope([freshEvent]), version: "1" }),
    ).toBeNull();
    expect(parseImportEnvelope({ app: "amalyn", version: 1 })).toBeNull();
  });

  it("accepts version-2 exports with valid challenge definitions", () => {
    const challengeRow = {
      id: "c1",
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 30,
      startDayKey: "2026-03-01",
      createdAt: Date.now() - 1000,
    };
    const result = parseImportEnvelope({
      app: "amalyn",
      version: 2,
      events: [freshEvent],
      challenges: [challengeRow],
    });
    expect(result).toEqual({ events: [freshEvent], challenges: [challengeRow] });
    // Version 2 must carry the challenges array, even when empty.
    expect(
      parseImportEnvelope({ app: "amalyn", version: 2, events: [freshEvent] }),
    ).toBeNull();
  });

  it("rejects version-2 exports whose challenge rows fail validation", () => {
    const base = {
      id: "c1",
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 30,
      startDayKey: "2026-03-01",
      createdAt: Date.now() - 1000,
    };
    const v2 = (challenge: unknown) => ({
      app: "amalyn",
      version: 2,
      events: [freshEvent],
      challenges: [challenge],
    });
    expect(parseImportEnvelope(v2({ ...base, dhikrId: "not-a-dhikr" }))).toBeNull();
    expect(parseImportEnvelope(v2({ ...base, dailyTarget: 0 }))).toBeNull();
    expect(parseImportEnvelope(v2({ ...base, dailyTarget: 10_001 }))).toBeNull();
    expect(parseImportEnvelope(v2({ ...base, durationDays: 366 }))).toBeNull();
    expect(parseImportEnvelope(v2({ ...base, startDayKey: "2026-13-01" }))).toBeNull();
    expect(parseImportEnvelope(v2({ ...base, id: "" }))).toBeNull();
    expect(parseImportEnvelope(v2("challenge"))).toBeNull();
  });

  it("accepts canonical per-challenge stream ids on challenge rows", () => {
    const row = {
      id: "c1",
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 30,
      startDayKey: "2026-03-01",
      createdAt: Date.now() - 1000,
      streamId: streamIdFor("c1"),
    };
    const streamEvent = { ...freshEvent, questId: streamIdFor("c1") };
    const result = parseImportEnvelope({
      app: "amalyn",
      version: 2,
      events: [streamEvent],
      challenges: [row],
    });
    expect(result).toEqual({
      events: [streamEvent],
      challenges: [row],
    });
  });

  it("rejects challenge rows pointing at another challenge's stream", () => {
    const base = {
      id: "c1",
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 30,
      startDayKey: "2026-03-01",
      createdAt: Date.now() - 1000,
    };
    const v2 = (challenge: unknown) => ({
      app: "amalyn",
      version: 2,
      events: [freshEvent],
      challenges: [challenge],
    });
    expect(
      parseImportEnvelope(v2({ ...base, streamId: streamIdFor("other") })),
    ).toBeNull();
    expect(parseImportEnvelope(v2({ ...base, streamId: 5 }))).toBeNull();
  });

  it("round-trips a mixed set of legacy and stream challenges", () => {
    const legacy = {
      id: "c0",
      dhikrId: "subhanallah",
      dailyTarget: 100,
      durationDays: 30,
      startDayKey: "2026-03-01",
      createdAt: Date.now() - 3000,
    };
    const streamed = (id: string) => ({
      id,
      dhikrId: "alhamdulillah",
      dailyTarget: 500,
      durationDays: 7,
      startDayKey: "2026-03-02",
      createdAt: Date.now() - 1000,
      streamId: streamIdFor(id),
    });
    const events = [
      freshEvent,
      { ...freshEvent, id: "e2", questId: streamIdFor("a1") },
      { ...freshEvent, id: "e3", questId: streamIdFor("b2") },
    ];
    const challenges = [legacy, streamed("a1"), streamed("b2")];
    const result = parseImportEnvelope({
      app: "amalyn",
      version: 2,
      events,
      challenges,
    });
    expect(result).toEqual({ events, challenges });
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
