// Shared types for the community outreach tool. Plain unions and const
// objects only: this code runs under node --experimental-strip-types,
// which rejects enums and namespaces.

export const STATUSES = [
  "DISCOVERED",
  "RESEARCHED",
  "QUALIFIED",
  "NEEDS_PERMISSION",
  "APPROVED_FOR_OUTREACH",
  "PUBLISHED",
  "COMPLETED",
  "REJECTED",
  "DO_NOT_CONTACT",
] as const;

export type OutreachStatus = (typeof STATUSES)[number];

export type Platform = "facebook_group" | "facebook_page" | "web";

// "other" = a real language was identified but is outside Amalyn's
// draftable set (en/bn); "unknown" = language not yet observed.
export type Lang = "en" | "bn" | "mixed" | "other" | "unknown";

// How a contribution (a post, a tool, a resource) can actually be accepted.
// Sourced only from explicit, attributable evidence - never inferred from
// silence.
export type ContributionPath =
  | "submission_form"
  | "admin_approval"
  | "direct_contact"
  | "none_observed";

export const CONTRIBUTION_PATHS: readonly ContributionPath[] = [
  "submission_form",
  "admin_approval",
  "direct_contact",
  "none_observed",
];

export type TopicCategory =
  | "adhkar"
  | "daily_practice"
  | "general"
  | "quotes"
  | "off_topic"
  | "unknown";

export type RulesStatus =
  // Resources/tools explicitly welcomed (quoted policy text).
  | "explicit_permit"
  // A documented review/contact-first process exists.
  | "approval_process"
  // Rules indicate admin approval is needed for posts/promos.
  | "permission_required"
  // Rules visible, no promotion restrictions found.
  | "permissive"
  // Rules/description prohibit advertising, self-promotion or links.
  | "anti_promo"
  // Not observable; never treated as permission.
  | "unknown";

export interface ScoreGates {
  total: boolean;
  topic: boolean;
  rules: boolean;
}

export interface ScoreBreakdown {
  topic: number;
  language: number;
  activity: number;
  rules: number;
  reach: number;
  total: number;
  gates: ScoreGates;
  // Human-readable justification per criterion; built only from recorded
  // fields, never guessed.
  reasons: string[];
}

export interface StoredDraft {
  en: string | null;
  bn: string | null;
  variant: number;
  generatedAt: string;
  // True once the operator edited the text by hand; regeneration warns.
  edited: boolean;
}

export interface Community {
  id: string;
  dedupKey: string;
  canonicalUrl: string;
  displayName: string;
  platform: Platform;
  status: OutreachStatus;
  lang: Lang;
  topic: TopicCategory;
  rules: RulesStatus;
  rulesUrl: string | null;
  rulesNote: string | null;
  // null means unknown; never fabricate a count.
  members: number | null;
  // ISO date of the most recent observed post, or null when unknown.
  lastPostAt: string | null;
  // Why this community is relevant. Required before qualification.
  evidence: string;
  // Short phrase (<= 80 chars) describing the community's focus, used in
  // drafts. Operator-authored; drafts interpolate nothing else free-form.
  focus: string;
  // Observed contribution channel, when one exists. Optional because
  // records created before scoring v2 predate the field.
  contributionPath?: ContributionPath | null;
  contributionNote?: string | null;
  fbGroupId: string | null;
  // Where this candidate came from (search engine, directory, manual).
  source: string;
  lastVerifiedAt: string | null;
  // URL of the actually-posted publication (required evidence for
  // PUBLISHED); doubles as the duplicate-posting guard.
  postUrl: string | null;
  dhikrId: string | null;
  draft: StoredDraft | null;
  permissionDraft: StoredDraft | null;
  score: ScoreBreakdown | null;
  aliases: string[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | "created"
  | "status_change"
  | "research"
  | "draft"
  | "note"
  | "merge"
  | "import";

export type Actor = "cli" | "board" | "system";

export interface OutreachEvent {
  at: string;
  actor: Actor;
  communityId: string;
  type: EventType;
  from?: OutreachStatus;
  to?: OutreachStatus;
  note?: string;
  data?: Record<string, string | number | boolean | null>;
}
