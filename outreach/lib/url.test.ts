import { describe, expect, it } from "vitest";

import { canonicalize, stripTrackingParams } from "./url.ts";

describe("canonicalize - facebook groups", () => {
  it("collapses host, suffix, query and casing variants to one key", () => {
    const variants = [
      "https://facebook.com/groups/DhakaDhikr",
      "https://www.facebook.com/groups/dhakadhikr/",
      "https://m.facebook.com/groups/DhakaDhikr/about",
      "https://mbasic.facebook.com/groups/DhakaDhikr/members",
      "https://web.facebook.com/groups/DhakaDhikr/posts/123456",
      "https://www.facebook.com/groups/DhakaDhikr/?sk=hchr&sorting_setting=CHRONOLOGICAL",
      "http://facebook.com/groups/DhakaDhikr/events",
      "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.facebook.com%2Fgroups%2FDhakaDhikr%2Fabout&fbclid=abc",
    ];
    const keys = new Set(
      variants.map((v) => canonicalize(v)?.dedupKey),
    );
    expect(keys).toEqual(new Set(["fb:group:dhakadhikr"]));

    const first = canonicalize(variants[0]);
    expect(first).toEqual({
      canonicalUrl: "https://facebook.com/groups/DhakaDhikr",
      dedupKey: "fb:group:dhakadhikr",
      platform: "facebook_group",
      fbGroupId: null,
    });
  });

  it("keeps the display slug casing but lowercases the key", () => {
    const target = canonicalize(
      "https://m.facebook.com/groups/BanglaDhikrFamily/about?mibextid=x",
    );
    expect(target?.canonicalUrl).toBe(
      "https://facebook.com/groups/BanglaDhikrFamily",
    );
    expect(target?.dedupKey).toBe("fb:group:bangladhikrfamily");
  });

  it("records the numeric group id when the slug is numeric", () => {
    const target = canonicalize(
      "https://www.facebook.com/groups/1234567890/about?fbclid=zz",
    );
    expect(target?.dedupKey).toBe("fb:group:1234567890");
    expect(target?.fbGroupId).toBe("1234567890");
    expect(target?.platform).toBe("facebook_group");
  });
});

describe("canonicalize - facebook pages", () => {
  it("keys legacy pages and people paths by numeric id", () => {
    const page = canonicalize(
      "https://www.facebook.com/pages/Daily-Amal-Reminders/987654321/posts",
    );
    expect(page?.dedupKey).toBe("fb:page:987654321");
    expect(page?.platform).toBe("facebook_page");

    const people = canonicalize(
      "https://m.facebook.com/people/Amal-Reminder/123123123/",
    );
    expect(people?.dedupKey).toBe("fb:page:123123123");

    const profile = canonicalize(
      "https://www.facebook.com/profile.php?id=555444333&sk=about&fbclid=q",
    );
    expect(profile?.dedupKey).toBe("fb:page:555444333");
    expect(profile?.canonicalUrl).toBe(
      "https://facebook.com/profile.php?id=555444333",
    );
  });

  it("treats a bare slug as a page and rejects system paths", () => {
    const page = canonicalize("https://facebook.com/DailyAmalReminders/");
    expect(page?.dedupKey).toBe("fb:page:dailyamalreminders");

    expect(canonicalize("https://facebook.com/watch/?v=1")).toBeNull();
    expect(canonicalize("https://facebook.com/share/p/abc123/")).toBeNull();
    expect(canonicalize("https://facebook.com/login/")).toBeNull();
  });
});

describe("canonicalize - generic web sources", () => {
  it("strips www, trailing slash, index.html and tracking params", () => {
    const target = canonicalize(
      "https://www.example.org/community/index.html?utm_source=x&keep=1&fbclid=y#refs",
    );
    expect(target).toEqual({
      canonicalUrl: "https://example.org/community?keep=1",
      dedupKey: "url:example.org/community",
      platform: "web",
      fbGroupId: null,
    });
  });

  it("sorts kept query params so param order does not change the URL", () => {
    const a = canonicalize("https://example.org/c?b=2&a=1");
    const b = canonicalize("https://example.org/c?a=1&b=2");
    expect(a?.canonicalUrl).toBe(b?.canonicalUrl);
  });

  it("keeps reddit and forum paths stable across host spellings", () => {
    const a = canonicalize("https://old.reddit.com/r/islam/");
    const b = canonicalize("https://reddit.com/r/islam");
    // old. is a genuinely different host; both dedup within themselves.
    expect(a?.dedupKey).toBe("url:old.reddit.com/r/islam");
    expect(b?.dedupKey).toBe("url:reddit.com/r/islam");
  });
});

describe("canonicalize - rejects invalid input", () => {
  it("returns null for malformed or non-community URLs", () => {
    expect(canonicalize("")).toBeNull();
    expect(canonicalize("not a url")).toBeNull();
    expect(canonicalize("ftp://example.org/x")).toBeNull();
    expect(canonicalize("javascript:alert(1)")).toBeNull();
    expect(canonicalize("https://facebook.com")).toBeNull();
  });
});

describe("stripTrackingParams", () => {
  it("drops known trackers and utm wildcards, sorts the rest", () => {
    const params = new URLSearchParams(
      "utm_campaign=launch&keep=2&fbclid=a&utm_content=b&another=1",
    );
    expect(stripTrackingParams(params)).toEqual([
      ["another", "1"],
      ["keep", "2"],
    ]);
  });
});
