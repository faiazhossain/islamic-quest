import { describe, expect, it } from "vitest";

import {
  inferTopic,
  nextTopic,
  qualifies,
  SCORING_VERSION,
  scoreCommunity,
} from "./scoring.ts";
import { FIXED_NOW } from "./testing.ts";

describe("scoreCommunity (v2 model)", () => {
  it("pins the model version so stored scores stay interpretable", () => {
    expect(SCORING_VERSION).toBe(2);
  });

  it("locks the v2 weight table against silent drift", () => {
    // Documented in outreach/README.md; change these only with a model
    // version bump and a migration note.
    const breakdown = scoreCommunity(
      {
        topic: "adhkar",
        lang: "en",
        rules: "explicit_permit",
        members: 5000,
        lastPostAt: "2026-10-10T00:00:00Z",
        contributionPath: "submission_form",
      },
      FIXED_NOW,
    );
    // 30 topic + 10 language + 15 activity + 30 welcome + 10 contribution
    // + 5 reach = 100: the model ceiling.
    expect(breakdown.total).toBe(100);
    expect(breakdown.reasons).toHaveLength(6);
  });

  it("ranks an approval-process community above a merely permissive one", () => {
    const base = {
      topic: "daily_practice" as const,
      lang: "en" as const,
      members: 5000 as number | null,
      lastPostAt: "2026-10-10T00:00:00Z",
    };
    const withApproval = scoreCommunity(
      { ...base, rules: "approval_process", contributionPath: "admin_approval" },
      FIXED_NOW,
    );
    const merelyPermissive = scoreCommunity(
      { ...base, rules: "permissive" },
      FIXED_NOW,
    );
    expect(withApproval.total).toBeGreaterThan(merelyPermissive.total);
    expect(withApproval.rules).toBe(24);
    expect(merelyPermissive.rules).toBe(12);
  });

  it("blocks qualification while rules are unknown, whatever the size", () => {
    const breakdown = scoreCommunity(
      {
        topic: "adhkar",
        lang: "en",
        rules: "unknown",
        members: 500000,
        lastPostAt: "2026-10-11T00:00:00Z",
      },
      FIXED_NOW,
    );
    expect(breakdown.gates.rules).toBe(false);
    expect(qualifies(breakdown)).toBe(false);
  });

  it("caps reach so enormous groups cannot dominate the ranking", () => {
    const base = {
      topic: "adhkar" as const,
      lang: "en" as const,
      rules: "permissive" as const,
      lastPostAt: "2026-10-11T00:00:00Z",
    };
    expect(scoreCommunity({ ...base, members: 2000000 }, FIXED_NOW).reach)
      .toBe(5);
    expect(scoreCommunity({ ...base, members: 1500 }, FIXED_NOW).reach)
      .toBe(5);
    expect(scoreCommunity({ ...base, members: 250 }, FIXED_NOW).reach)
      .toBe(4);
    expect(scoreCommunity({ ...base, members: 40 }, FIXED_NOW).reach)
      .toBe(1);
    expect(scoreCommunity({ ...base, members: null }, FIXED_NOW).reach)
      .toBe(2);
  });

  it("blocks quote-only and off-topic communities at the topic gate", () => {
    for (const topic of ["quotes", "off_topic", "unknown"] as const) {
      const breakdown = scoreCommunity(
        {
          topic,
          lang: "en",
          rules: "permissive",
          members: 20000,
          lastPostAt: "2026-10-11T00:00:00Z",
        },
        FIXED_NOW,
      );
      expect(breakdown.gates.topic).toBe(false);
      expect(qualifies(breakdown)).toBe(false);
    }
    // A general community sits exactly at the topic gate.
    const general = scoreCommunity(
      {
        topic: "general",
        lang: "en",
        rules: "permissive",
        members: 5000,
        lastPostAt: "2026-10-11T00:00:00Z",
      },
      FIXED_NOW,
    );
    expect(general.gates.topic).toBe(true);
  });

  it("decays activity by observed recency and never guesses it", () => {
    const base = {
      topic: "daily_practice" as const,
      lang: "en" as const,
      rules: "permissive" as const,
      members: 2000 as number | null,
    };
    expect(
      scoreCommunity(
        { ...base, lastPostAt: "2026-10-06T00:00:00Z" },
        FIXED_NOW,
      ).activity,
    ).toBe(15);
    expect(
      scoreCommunity(
        { ...base, lastPostAt: "2026-09-20T00:00:00Z" },
        FIXED_NOW,
      ).activity,
    ).toBe(11);
    expect(
      scoreCommunity(
        { ...base, lastPostAt: "2026-08-01T00:00:00Z" },
        FIXED_NOW,
      ).activity,
    ).toBe(6);
    expect(
      scoreCommunity(
        { ...base, lastPostAt: "2026-01-01T00:00:00Z" },
        FIXED_NOW,
      ).activity,
    ).toBe(0);
    expect(scoreCommunity({ ...base, lastPostAt: null }, FIXED_NOW).activity)
      .toBe(0);
    // An unparseable date scores like unknown rather than throwing.
    expect(
      scoreCommunity({ ...base, lastPostAt: "not-a-date" }, FIXED_NOW)
        .activity,
    ).toBe(0);
  });

  it("scores the contribution path from recorded evidence only", () => {
    const base = {
      topic: "general" as const,
      lang: "en" as const,
      rules: "explicit_permit" as const,
      members: 300 as number | null,
      lastPostAt: "2026-10-11T00:00:00Z",
    };
    expect(
      scoreCommunity({ ...base, contributionPath: "submission_form" }, FIXED_NOW)
        .total,
    ).toBe(10 + 10 + 15 + 30 + 10 + 4);
    expect(
      scoreCommunity({ ...base, contributionPath: "direct_contact" }, FIXED_NOW)
        .total,
    ).toBe(10 + 10 + 15 + 30 + 5 + 4);
    // Missing field (pre-v2 records) behaves like none_observed.
    expect(scoreCommunity(base, FIXED_NOW).total).toBe(
      10 + 10 + 15 + 30 + 0 + 4,
    );
  });
});

describe("inferTopic", () => {
  it("matches english and bangla topic keywords in priority order", () => {
    expect(inferTopic("Daily Dhikr & Azkar Reminders")).toBe("adhkar");
    expect(inferTopic("তাসবিহ ও জিকির গ্রুপ")).toBe("adhkar");
    expect(inferTopic("Muslim Habits and Consistency")).toBe("daily_practice");
    expect(inferTopic("নিয়মিত আমলের অভ্যাস")).toBe("daily_practice");
    expect(inferTopic("Islamic Quotes and Motivation")).toBe("quotes");
    expect(inferTopic("Muslim Community of Chicago")).toBe("general");
    expect(inferTopic("Cricket Fans Bangladesh")).toBe("unknown");
  });

  it("prefers adhkar over general when both keyword sets match", () => {
    expect(inferTopic("Dhikr for the Muslim Ummah")).toBe("adhkar");
  });

  it("recognizes the v2 discovery families", () => {
    expect(inferTopic("30-Day Dhikr Challenge Accountability")).toBe("adhkar");
    expect(inferTopic("Muslim Accountability Partners")).toBe("daily_practice");
    expect(inferTopic("Worship Consistency Circle")).toBe("daily_practice");
    expect(inferTopic("আমল চ্যালেঞ্জ গ্রুপ")).toBe("daily_practice");
    expect(inferTopic("MSA at University of Toronto")).toBe("general");
    expect(inferTopic("Muslim Students Association")).toBe("general");
  });
});

describe("nextTopic", () => {
  it("never overwrites a recorded classification with a new inference", () => {
    // Incremental evidence updates (about-page verification) often lack
    // topic keywords; the recorded topic must survive them.
    expect(nextTopic("daily_practice", undefined, "about page fetched logged-out, no keywords")).toBe(
      "daily_practice",
    );
    expect(nextTopic("adhkar", undefined, "no keywords here either")).toBe("adhkar");
  });

  it("infers only when the topic was never set and input exists", () => {
    expect(nextTopic("unknown", undefined, "daily dhikr threads")).toBe("adhkar");
    expect(nextTopic("unknown", undefined, "no keywords")).toBe("unknown");
    expect(nextTopic("unknown", undefined, undefined)).toBe("unknown");
  });

  it("lets an explicit topic win and even change a recorded one", () => {
    expect(nextTopic("daily_practice", "adhkar", "daily dhikr threads")).toBe("adhkar");
    expect(nextTopic("general", "quotes", undefined)).toBe("quotes");
  });
});
