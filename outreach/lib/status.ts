// Guarded status transitions. The table below is the single source of
// truth; applyTransition refuses anything not listed and throws with the
// table so the operator can see the legal moves. Illegal transitions
// never touch disk.

import type {
  Actor,
  Community,
  OutreachEvent,
  OutreachStatus,
} from "./types.ts";
import { qualifies, scoreCommunity } from "./scoring.ts";

export const TRANSITIONS: Record<OutreachStatus, readonly OutreachStatus[]> = {
  DISCOVERED: ["RESEARCHED", "REJECTED", "DO_NOT_CONTACT"],
  RESEARCHED: ["QUALIFIED", "REJECTED", "DO_NOT_CONTACT"],
  QUALIFIED: [
    "NEEDS_PERMISSION",
    "APPROVED_FOR_OUTREACH",
    "REJECTED",
    "DO_NOT_CONTACT",
  ],
  NEEDS_PERMISSION: [
    "APPROVED_FOR_OUTREACH",
    "REJECTED",
    "DO_NOT_CONTACT",
  ],
  APPROVED_FOR_OUTREACH: ["PUBLISHED", "REJECTED", "DO_NOT_CONTACT"],
  PUBLISHED: ["COMPLETED", "DO_NOT_CONTACT"],
  COMPLETED: [],
  REJECTED: ["RESEARCHED"],
  DO_NOT_CONTACT: [],
};

export const STATUS_ACTIONS: Record<string, OutreachStatus> = {
  research: "RESEARCHED",
  qualify: "QUALIFIED",
  "request-permission": "NEEDS_PERMISSION",
  approve: "APPROVED_FOR_OUTREACH",
  publish: "PUBLISHED",
  complete: "COMPLETED",
  reject: "REJECTED",
  block: "DO_NOT_CONTACT",
  reopen: "RESEARCHED",
};

export class TransitionError extends Error {}

export interface TransitionContext {
  actor: Actor;
  at?: Date;
  note?: string;
  // Required for REJECTED and DO_NOT_CONTACT.
  reason?: string;
  // Required for PUBLISHED; recorded as evidence of the actual post.
  postUrl?: string;
  // Required when approving from NEEDS_PERMISSION (an admin said yes).
  granted?: boolean;
}

export interface TransitionResult {
  community: Community;
  event: OutreachEvent;
}

function requireReason(ctx: TransitionContext, to: OutreachStatus): string {
  const reason = ctx.reason?.trim();
  if (!reason) {
    throw new TransitionError(
      `moving to ${to} requires a --reason (kept in the audit log)`,
    );
  }
  return reason;
}

// Apply one guarded transition. Returns the updated community (not yet
// persisted) plus the audit event to append.
export function applyTransition(
  community: Community,
  to: OutreachStatus,
  ctx: TransitionContext,
): TransitionResult {
  const from = community.status;
  const at = (ctx.at ?? new Date()).toISOString();

  if (from === to) {
    throw new TransitionError(`${from} -> ${to}: community is already there`);
  }
  if (!TRANSITIONS[from].includes(to)) {
    const legal = Object.entries(TRANSITIONS)
      .map(([state, targets]) => `  ${state} -> ${targets.join(", ") || "(terminal)"}`)
      .join("\n");
    throw new TransitionError(
      `illegal transition ${from} -> ${to}. Legal moves:\n${legal}`,
    );
  }

  const next: Community = { ...community, updatedAt: at };
  const data: Record<string, string | number | boolean | null> = {};
  let note = ctx.note?.trim() || "";

  if (to === "RESEARCHED" && from === "DISCOVERED") {
    if (!community.evidence.trim()) {
      throw new TransitionError(
        "RESEARCHED requires recorded evidence (run: outreach research <id> ...)",
      );
    }
    if (!next.lastVerifiedAt) next.lastVerifiedAt = at;
  }

  if (to === "QUALIFIED") {
    const breakdown =
      community.score ?? scoreCommunity(community, ctx.at ?? new Date());
    if (!qualifies(breakdown)) {
      throw new TransitionError(
        `qualification gates not met (total ${breakdown.total}, gates ` +
          `total=${breakdown.gates.total} topic=${breakdown.gates.topic} ` +
          `rules=${breakdown.gates.rules}). Record: outreach research <id> ...`,
      );
    }
    next.score = breakdown;
    if (!community.evidence.trim()) {
      throw new TransitionError(
        "qualification requires recorded evidence describing relevance",
      );
    }
  }

  if (to === "NEEDS_PERMISSION") {
    if (
      community.rules !== "permission_required" &&
      !community.rulesNote?.trim()
    ) {
      throw new TransitionError(
        "NEEDS_PERMISSION requires permission-required evidence " +
          "(rules marked permission_required or a rules note)",
      );
    }
  }

  if (to === "APPROVED_FOR_OUTREACH" && from === "QUALIFIED") {
    // Direct approval is legitimate exactly when no permission gate was
    // observed: rules are permissive, or explicitly welcome contributions.
    // Anything else must travel through NEEDS_PERMISSION with --granted.
    if (community.rules !== "permissive" && community.rules !== "explicit_permit") {
      throw new TransitionError(
        "approving straight from QUALIFIED requires rules marked permissive " +
          "or explicit_permit; if an admin granted permission use --granted",
      );
    }
  }

  if (to === "APPROVED_FOR_OUTREACH" && from === "NEEDS_PERMISSION") {
    if (ctx.granted !== true) {
      throw new TransitionError(
        "approving a permission request requires --granted " +
          "(recorded in the audit log with who/when)",
      );
    }
    data.granted = true;
    if (!note) note = "permission granted by an administrator";
  }

  if (to === "PUBLISHED") {
    const postUrl = ctx.postUrl?.trim();
    if (!postUrl) {
      throw new TransitionError(
        "PUBLISHED requires the --post-url of the actual post (never claim a " +
          "publication without platform-visible evidence)",
      );
    }
    next.postUrl = postUrl;
    data.postUrl = postUrl;
  }

  if (to === "COMPLETED" && !note) {
    throw new TransitionError(
      "COMPLETED requires an outcome note (--note ...) for the audit log",
    );
  }

  if ((to === "REJECTED" || to === "DO_NOT_CONTACT") && !note) {
    note = requireReason(ctx, to);
  }

  next.status = to;

  const event: OutreachEvent = {
    at,
    actor: ctx.actor,
    communityId: community.id,
    type: "status_change",
    from,
    to,
    note: note || undefined,
    data: Object.keys(data).length > 0 ? data : undefined,
  };

  return { community: next, event };
}
