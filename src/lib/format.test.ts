import { describe, expect, it } from "vitest";
import { formatCount, formatShortDate, toBnDigits } from "./format";

const BENGALI_DIGITS = /^[০-৯.,\s/]+$/u;

describe("formatCount", () => {
  it("formats en-US by default", () => {
    expect(formatCount(1234)).toBe("1,234");
  });

  it("formats Bengali digits in bn mode", () => {
    expect(formatCount(1234, "bn")).toBe("১,২৩৪");
    expect(formatCount(100, "bn")).toMatch(BENGALI_DIGITS);
  });
});

describe("formatShortDate", () => {
  it("formats en-US short dates by default", () => {
    // Fixed epoch: 2026-03-05 local noon.
    const ms = new Date(2026, 2, 5, 12).getTime();
    expect(formatShortDate(ms)).toMatch(/Mar 5, 2026/);
  });

  it("renders Bengali script dates in bn mode", () => {
    const ms = new Date(2026, 2, 5, 12).getTime();
    const bn = formatShortDate(ms, "bn");
    expect(bn).toMatch(/\p{Script=Bengali}/u);
  });
});

describe("toBnDigits", () => {
  it("converts ASCII digits while keeping letters", () => {
    expect(toBnDigits("6307")).toBe("৬৩০৭");
    expect(toBnDigits("596a")).toBe("৫৯৬a");
    expect(toBnDigits("6307; 2702")).toBe("৬৩০৭; ২৭০২");
  });
});
