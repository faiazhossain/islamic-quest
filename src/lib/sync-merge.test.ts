import { describe, expect, it } from "vitest";
import { diffServerEvents, type SyncEvent } from "./sync-merge";

const event = (id: string): SyncEvent => ({
  id,
  type: "increment",
  questId: "q1",
  delta: 1,
  at: 1_000,
});

describe("diffServerEvents", () => {
  it("returns only server events missing locally", () => {
    const localIds = new Set(["a", "b"]);
    const server = [event("a"), event("c"), event("d")];
    expect(diffServerEvents(localIds, server).map((e) => e.id)).toEqual(["c", "d"]);
  });

  it("returns nothing when the local log is complete", () => {
    const localIds = new Set(["a", "b"]);
    expect(diffServerEvents(localIds, [event("a"), event("b")])).toEqual([]);
  });

  it("keeps local history on id collision regardless of content", () => {
    const localIds = new Set(["a"]);
    const server = [{ ...event("a"), delta: 99 }];
    expect(diffServerEvents(localIds, server)).toEqual([]);
  });

  it("handles an empty server snapshot", () => {
    expect(diffServerEvents(new Set(), [])).toEqual([]);
  });
});
