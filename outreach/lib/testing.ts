// Shared test fixture factory. Not a test file; imported by the
// colocated *.test.ts suites.

import type { Community } from "./types.ts";

export const FIXED_NOW = new Date("2026-10-12T00:00:00Z");

export function makeCommunity(
  overrides: Partial<Community> = {},
): Community {
  const now = FIXED_NOW.toISOString();
  return {
    id: "fb-group-testgroup-abcdef01",
    dedupKey: "fb:group:testgroup",
    canonicalUrl: "https://facebook.com/groups/TestGroup",
    displayName: "Test Dhikr Group",
    platform: "facebook_group",
    status: "DISCOVERED",
    lang: "en",
    topic: "adhkar",
    rules: "permissive",
    rulesUrl: null,
    rulesNote: null,
    members: 5000,
    lastPostAt: "2026-10-10T00:00:00Z",
    evidence: "",
    focus: "",
    fbGroupId: null,
    source: "test",
    lastVerifiedAt: null,
    postUrl: null,
    dhikrId: null,
    draft: null,
    permissionDraft: null,
    score: null,
    aliases: [],
    note: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
