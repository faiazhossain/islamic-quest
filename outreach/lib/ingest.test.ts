import { describe, expect, it } from "vitest";

import { parseIngest } from "./ingest.ts";

describe("parseIngest", () => {
  it("parses markdown, TSV and bare URL lines", () => {
    const result = parseIngest(
      [
        "# discovery run 2026-10-12",
        "",
        "[Dhaka Dhikr Family](https://www.facebook.com/groups/DhakaDhikr/about) - very active",
        "Quran Consistency\t https://facebook.com/groups/quranconsist/?fbclid=abc \tdaily reminder threads",
        "https://m.facebook.com/groups/dailyamalreminders",
        "https://facebook.com/groups/dailyamalreminders/about\tposts within the hour",
      ].join("\n"),
    );

    expect(result.candidates).toHaveLength(3);
    expect(result.issues).toHaveLength(0);

    const [markdown, tsv, bare] = result.candidates;
    expect(markdown.name).toBe("Dhaka Dhikr Family");
    expect(markdown.note).toBe("- very active".replace("- ", ""));
    expect(markdown.dedupKey).toBe("fb:group:dhakadhikr");

    expect(tsv.name).toBe("Quran Consistency");
    expect(tsv.note).toBe("daily reminder threads");
    expect(tsv.dedupKey).toBe("fb:group:quranconsist");

    expect(bare.name).toBeNull();
    expect(bare.dedupKey).toBe("fb:group:dailyamalreminders");

    // The TSV duplicate of the bare URL collapses in-file.
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].reason).toContain("duplicate of line 5");
  });

  it("reports malformed lines without failing the whole batch", () => {
    const result = parseIngest(
      [
        "https://facebook.com/groups/fine",
        "no url on this line at all",
        "https://facebook.com/watch/?v=1",
      ].join("\n"),
    );
    expect(result.candidates).toHaveLength(1);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]).toMatchObject({ line: 2, reason: "no URL found" });
    expect(result.issues[1]).toMatchObject({
      line: 3,
      reason: "not a recognizable community URL",
    });
  });

  it("strips trailing punctuation from pasted URLs", () => {
    const result = parseIngest(
      "Check this one: https://facebook.com/groups/PasteTest.",
    );
    expect(result.candidates[0].url).toBe(
      "https://facebook.com/groups/PasteTest",
    );
  });

  it("handles a full search-results paste (urls mixed into prose)", () => {
    const result = parseIngest(
      [
        "Here are some results I found:",
        "1) Daily Dhikr Reminders https://www.facebook.com/groups/dailydhikrrem/ join",
        "2) https://facebook.com/people/Amal-Page/999888777/ - page",
      ].join("\n"),
    );
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0].dedupKey).toBe("fb:group:dailydhikrrem");
    expect(result.candidates[1].dedupKey).toBe("fb:page:999888777");
  });
});
