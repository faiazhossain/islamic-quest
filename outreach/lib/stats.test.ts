import { describe, expect, it } from "vitest";

import { computeStats } from "./stats.ts";
import { makeCommunity } from "./testing.ts";

describe("computeStats", () => {
  it("counts communities per status and nothing else", () => {
    const communities = [
      makeCommunity({ status: "DISCOVERED" }),
      makeCommunity({ status: "DISCOVERED" }),
      makeCommunity({ status: "RESEARCHED" }),
      makeCommunity({ status: "QUALIFIED" }),
      makeCommunity({ status: "PUBLISHED" }),
      makeCommunity({ status: "REJECTED" }),
      makeCommunity({ status: "DO_NOT_CONTACT" }),
    ];
    const stats = computeStats(communities);

    expect(stats.total).toBe(7);
    expect(stats.counts.DISCOVERED).toBe(2);
    expect(stats.counts.RESEARCHED).toBe(1);
    expect(stats.counts.QUALIFIED).toBe(1);
    expect(stats.counts.PUBLISHED).toBe(1);
    expect(stats.counts.REJECTED).toBe(1);
    expect(stats.counts.DO_NOT_CONTACT).toBe(1);
    // Every status has a bucket, so callers never hit undefined.
    expect(Object.keys(stats.counts)).toHaveLength(9);
    expect(stats.counts.COMPLETED).toBe(0);
    expect(stats.counts.NEEDS_PERMISSION).toBe(0);
    expect(stats.counts.APPROVED_FOR_OUTREACH).toBe(0);
  });

  it("handles an empty store", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    for (const count of Object.values(stats.counts)) expect(count).toBe(0);
  });
});
