// Transparent relevance rubric, v2. Weights sum to 100 and every point
// is justified in `reasons` from recorded fields only.
//
// v2 changes (2026-10-12, after the first qualification pass showed that
// enormous reminder groups overwhelmingly prohibit promotion):
// - The welcome dimension (recorded in the `rules` field) now carries the
//   most weight and distinguishes explicit permission and documented
//   approval processes from mere absence of restrictions.
// - Unknown rules score zero: silence is never treated as permission.
// - Reach is capped at 5 so huge but unsuitable groups cannot dominate.
// - A contribution-path dimension rewards a credible, low-friction way
//   to actually contribute a resource.

import type {
  ContributionPath,
  Lang,
  RulesStatus,
  ScoreBreakdown,
  TopicCategory,
} from "./types.ts";

export const SCORING_VERSION = 2;

export const QUALIFY_MIN_TOTAL = 60;
export const QUALIFY_MIN_TOPIC = 10; // general or better
export const QUALIFY_MIN_RULES = 12; // permissive or better

const TOPIC_SCORE: Record<TopicCategory, number> = {
  adhkar: 30,
  daily_practice: 22,
  general: 10,
  quotes: 3,
  off_topic: 0,
  unknown: 0,
};

const LANG_SCORE: Record<Lang, number> = {
  en: 10,
  bn: 10,
  mixed: 6,
  other: 0,
  unknown: 0,
};

const ACTIVITY_RECENT_DAYS = 15;
const ACTIVITY_THIS_MONTH_DAYS = 11;
const ACTIVITY_THIS_QUARTER_DAYS = 6;

// Ordered from strongest to weakest. Only attributable policy evidence
// maps here; "unknown" intentionally scores zero.
const WELCOME_SCORE: Record<RulesStatus, number> = {
  explicit_permit: 30,
  approval_process: 24,
  permission_required: 18,
  permissive: 12,
  anti_promo: 0,
  unknown: 0,
};

const CONTRIBUTION_SCORE: Record<ContributionPath, number> = {
  submission_form: 10,
  admin_approval: 7,
  direct_contact: 5,
  none_observed: 0,
};

// Deliberately flat above 1,000 members: beyond that, size barely
// changes whether outreach makes sense, so it must not dominate.
function reachPoints(members: number | null): {
  points: number;
  reason: string;
} {
  if (members === null) {
    return { points: 2, reason: "reach: member count unknown (2)" };
  }
  if (members >= 1000) {
    return { points: 5, reason: `reach: ${members} members (5)` };
  }
  if (members >= 100) {
    return { points: 4, reason: `reach: ${members} members (4)` };
  }
  if (members >= 1) {
    return { points: 1, reason: `reach: ${members} members (1)` };
  }
  return { points: 1, reason: `reach: ${members} members (1)` };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function activityPoints(
  lastPostAt: string | null,
  now: Date,
): { points: number; reason: string } {
  if (lastPostAt === null) {
    return {
      points: 0,
      reason: "activity: no observed post date recorded (0)",
    };
  }
  const then = new Date(lastPostAt);
  if (Number.isNaN(then.getTime())) {
    return {
      points: 0,
      reason: "activity: recorded post date is unparseable (0)",
    };
  }
  const days = Math.floor((now.getTime() - then.getTime()) / DAY_MS);
  if (days <= 7) {
    return {
      points: ACTIVITY_RECENT_DAYS,
      reason: `activity: post observed ${then.toISOString().slice(0, 10)}, within 7 days (${ACTIVITY_RECENT_DAYS})`,
    };
  }
  if (days <= 30) {
    return {
      points: ACTIVITY_THIS_MONTH_DAYS,
      reason: `activity: post observed ${then.toISOString().slice(0, 10)}, within 30 days (${ACTIVITY_THIS_MONTH_DAYS})`,
    };
  }
  if (days <= 90) {
    return {
      points: ACTIVITY_THIS_QUARTER_DAYS,
      reason: `activity: post observed ${then.toISOString().slice(0, 10)}, within 90 days (${ACTIVITY_THIS_QUARTER_DAYS})`,
    };
  }
  return {
    points: 0,
    reason: `activity: last observed post ${then.toISOString().slice(0, 10)} is over 90 days old (0)`,
  };
}

export interface ScorableFields {
  topic: TopicCategory;
  lang: Lang;
  rules: RulesStatus;
  members: number | null;
  lastPostAt: string | null;
  contributionPath?: ContributionPath | null;
}

export function scoreCommunity(
  input: ScorableFields,
  now: Date = new Date(),
): ScoreBreakdown {
  const topic = TOPIC_SCORE[input.topic];
  const language = LANG_SCORE[input.lang];
  const rules = WELCOME_SCORE[input.rules];
  const activity = activityPoints(input.lastPostAt, now);
  const reach = reachPoints(input.members);
  const contribution =
    CONTRIBUTION_SCORE[input.contributionPath ?? "none_observed"];

  const total =
    topic + language + activity.points + rules + reach.points + contribution;
  const reasons = [
    `topic: ${input.topic} (${topic})`,
    `language: ${input.lang} (${language})`,
    activity.reason,
    `welcome: ${input.rules} (${rules})`,
    `contribution: ${input.contributionPath ?? "none_observed"} (${contribution})`,
    reach.reason,
  ];

  return {
    topic,
    language,
    activity: activity.points,
    rules,
    reach: reach.points,
    total,
    gates: {
      total: total >= QUALIFY_MIN_TOTAL,
      topic: topic >= QUALIFY_MIN_TOPIC,
      rules: rules >= QUALIFY_MIN_RULES,
    },
    reasons,
  };
}

export function qualifies(breakdown: ScoreBreakdown): boolean {
  return breakdown.gates.total && breakdown.gates.topic && breakdown.gates.rules;
}

// Keyword inference as a research convenience; recorded evidence always
// governs and the operator can override with an explicit --topic.
// ASCII terms use \b boundaries; Bangla terms are bare alternations
// because \b is ASCII-only and would never match Bengali script.
const TOPIC_KEYWORDS: [TopicCategory, RegExp][] = [
  [
    "adhkar",
    /\b(?:dhikr|zikr|jikir|azkar|adhkar|tasbih|tasbeeh|istighfar|istighfaar|astaghfirullah|durood|darood|salawat|kalima)\b|জিকির|আজকার|তাসবিহ|ইস্তিগফার|দরূদ|কালেমা/iu,
  ],
  [
    "daily_practice",
    // Whole-word alternatives live inside the \b group; prefix stems
    // (accountab, worship con, daily practi) sit outside it because a
    // trailing \b would prevent them from ever matching.
    /\b(?:daily\s+amal|a'?mal|amaal|habits?|consistency|amol|deeds?|challenges?)\b|accountab|worship\s+con|daily\s+practi|আমল|নিয়মিত|অভ্যাস|প্রতিদিনের|চ্যালেঞ্জ/iu,
  ],
  ["quotes", /\b(?:quotes?|motivation|inspiration|sayings)\b|উক্তি|উদ্ধৃতি/iu],
  [
    "general",
    /\b(?:muslim|islam|mosque|masjid|deen|imam|student|students|university|campus|msa|forum)\b|মুসলিম|ইসলাম|মসজিদ|দ্বীন|ছাত্র/iu,
  ],
];

export function inferTopic(text: string): TopicCategory {
  for (const [category, pattern] of TOPIC_KEYWORDS) {
    if (pattern.test(text)) return category;
  }
  return "unknown";
}

// Topic resolution for incremental research updates. An explicit --topic
// always wins; a recorded classification is never overwritten by a new
// inference (evidence updates often lack topic keywords); inference only
// fills an unset topic.
export function nextTopic(
  current: TopicCategory,
  explicit: TopicCategory | undefined,
  inferenceInput: string | undefined,
): TopicCategory {
  if (explicit !== undefined) return explicit;
  if (current !== "unknown") return current;
  if (inferenceInput === undefined) return current;
  return inferTopic(inferenceInput);
}
