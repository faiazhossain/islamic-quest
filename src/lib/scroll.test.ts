import { describe, expect, it } from "vitest";

import { moreContentBelow } from "./scroll";

describe("moreContentBelow", () => {
  it("is false when the page fits without scrolling", () => {
    expect(moreContentBelow(800, 800, 0)).toBe(false);
  });

  it("is false for a sub-slack overflow treated as fitting", () => {
    expect(moreContentBelow(806, 800, 0)).toBe(false);
  });

  it("is true when scrolled content remains below the fold", () => {
    expect(moreContentBelow(2000, 800, 0)).toBe(true);
    expect(moreContentBelow(2000, 800, 400)).toBe(true);
  });

  it("is false once the user reaches the bottom", () => {
    expect(moreContentBelow(2000, 800, 1200)).toBe(false);
  });

  it("is false within the slack distance of the bottom", () => {
    expect(moreContentBelow(2000, 800, 1194)).toBe(false);
  });

  it("is false for non-finite measurements", () => {
    expect(moreContentBelow(Number.NaN, 800, 0)).toBe(false);
    expect(moreContentBelow(2000, Number.POSITIVE_INFINITY, 0)).toBe(false);
  });
});
