import { describe, expect, it } from "vitest";

import { applyTransition, STATUS_ACTIONS, TransitionError } from "./status.ts";
import { FIXED_NOW, makeCommunity } from "./testing.ts";

const CTX = { actor: "cli" as const, at: FIXED_NOW };

function researched(overrides = {}) {
  return makeCommunity({
    status: "RESEARCHED",
    evidence: "daily dhikr reminder threads observed in public posts",
    lastVerifiedAt: FIXED_NOW.toISOString(),
    ...overrides,
  });
}

describe("applyTransition - happy path", () => {
  it("moves DISCOVERED -> RESEARCHED when evidence exists", () => {
    const community = makeCommunity({
      evidence: "public posts show weekly dhikr threads",
    });
    const { community: next, event } = applyTransition(
      community,
      "RESEARCHED",
      CTX,
    );
    expect(next.status).toBe("RESEARCHED");
    expect(next.updatedAt).toBe(FIXED_NOW.toISOString());
    expect(event.type).toBe("status_change");
    expect(event.from).toBe("DISCOVERED");
    expect(event.to).toBe("RESEARCHED");
    expect(event.communityId).toBe(community.id);
  });

  it("rejects DISCOVERED -> RESEARCHED without evidence", () => {
    expect(() =>
      applyTransition(makeCommunity(), "RESEARCHED", CTX),
    ).toThrow(TransitionError);
  });

  it("qualifies from a recorded qualifying score", () => {
    const community = researched({
      score: {
        topic: 35,
        language: 20,
        activity: 20,
        rules: 15,
        reach: 8,
        total: 98,
        gates: { total: true, topic: true, rules: true },
        reasons: ["recorded during research"],
      },
    });
    const { community: next } = applyTransition(community, "QUALIFIED", CTX);
    expect(next.status).toBe("QUALIFIED");
  });

  it("recomputes the score when none is recorded and gates pass", () => {
    // Fixture fields under the v2 model: adhkar 30 + en 10 + activity 15
    // + permissive 12 + 5000 members 5 = 72.
    const { community } = applyTransition(researched(), "QUALIFIED", CTX);
    expect(community.status).toBe("QUALIFIED");
    expect(community.score?.total).toBe(72);
  });

  it("refuses qualification when gates fail", () => {
    const community = researched({ rules: "unknown", members: null });
    // 35 + 20 + 20 + 4 + 3 = 82 total but the rules gate blocks.
    expect(() => applyTransition(community, "QUALIFIED", CTX)).toThrow(
      /rules gate|qualification gates/,
    );
  });

  it("requires permission evidence for NEEDS_PERMISSION", () => {
    expect(() =>
      applyTransition(
        makeCommunity({ status: "QUALIFIED", score: null }),
        "NEEDS_PERMISSION",
        CTX,
      ),
    ).toThrow(TransitionError);

    const ok = applyTransition(
      makeCommunity({
        status: "QUALIFIED",
        rules: "permission_required",
        rulesNote: "pinned rules ask admins to approve promos",
      }),
      "NEEDS_PERMISSION",
      CTX,
    );
    expect(ok.community.status).toBe("NEEDS_PERMISSION");
  });

  it("approves from QUALIFIED only when rules are permissive or explicitly welcoming", () => {
    expect(() =>
      applyTransition(
        makeCommunity({
          status: "QUALIFIED",
          rules: "permission_required",
        }),
        "APPROVED_FOR_OUTREACH",
        CTX,
      ),
    ).toThrow(/permissive|--granted/);

    const ok = applyTransition(
      makeCommunity({ status: "QUALIFIED", rules: "permissive" }),
      "APPROVED_FOR_OUTREACH",
      CTX,
    );
    expect(ok.community.status).toBe("APPROVED_FOR_OUTREACH");

    // explicit_permit is a stronger welcome signal and must not be
    // forced through the permission-request path.
    const explicitOk = applyTransition(
      makeCommunity({ status: "QUALIFIED", rules: "explicit_permit" }),
      "APPROVED_FOR_OUTREACH",
      CTX,
    );
    expect(explicitOk.community.status).toBe("APPROVED_FOR_OUTREACH");

    // approval_process is a documented gate: it must go through
    // NEEDS_PERMISSION, never straight to approval.
    expect(() =>
      applyTransition(
        makeCommunity({ status: "QUALIFIED", rules: "approval_process" }),
        "APPROVED_FOR_OUTREACH",
        CTX,
      ),
    ).toThrow(/permissive|--granted/);
  });

  it("approving from NEEDS_PERMISSION requires --granted", () => {
    const community = makeCommunity({
      status: "NEEDS_PERMISSION",
      rules: "permission_required",
    });
    expect(() =>
      applyTransition(community, "APPROVED_FOR_OUTREACH", CTX),
    ).toThrow(/--granted/);

    const { community: next, event } = applyTransition(
      community,
      "APPROVED_FOR_OUTREACH",
      { ...CTX, granted: true },
    );
    expect(next.status).toBe("APPROVED_FOR_OUTREACH");
    expect(event.data?.granted).toBe(true);
  });

  it("publishing requires a post URL and records it", () => {
    const approved = makeCommunity({ status: "APPROVED_FOR_OUTREACH" });
    expect(() => applyTransition(approved, "PUBLISHED", CTX)).toThrow(
      /--post-url/,
    );

    const { community } = applyTransition(approved, "PUBLISHED", {
      ...CTX,
      postUrl: "https://facebook.com/groups/TestGroup/posts/999",
    });
    expect(community.status).toBe("PUBLISHED");
    expect(community.postUrl).toBe(
      "https://facebook.com/groups/TestGroup/posts/999",
    );
  });

  it("completes directly from PUBLISHED with an outcome note", () => {
    const published = makeCommunity({
      status: "PUBLISHED",
      postUrl: "https://facebook.com/groups/TestGroup/posts/999",
    });
    const { community } = applyTransition(published, "COMPLETED", {
      ...CTX,
      note: "shared once; the record keeps the post URL",
    });
    expect(community.status).toBe("COMPLETED");
    expect(community.postUrl).toBe(
      "https://facebook.com/groups/TestGroup/posts/999",
    );

    // No follow-up stage exists: nothing schedules a return visit.
    expect(() =>
      applyTransition(published, "FOLLOW_UP_DUE" as never, CTX),
    ).toThrow(TransitionError);
  });

  it("completing requires an outcome note", () => {
    const published = makeCommunity({
      status: "PUBLISHED",
      postUrl: "https://x.example/p1",
    });
    expect(() => applyTransition(published, "COMPLETED", CTX)).toThrow(
      /--note/,
    );
  });
});

describe("applyTransition - guard rails", () => {
  it("requires reasons for REJECTED and DO_NOT_CONTACT", () => {
    expect(() =>
      applyTransition(makeCommunity(), "REJECTED", CTX),
    ).toThrow(/--reason/);
    expect(() =>
      applyTransition(makeCommunity(), "DO_NOT_CONTACT", CTX),
    ).toThrow(/--reason/);
  });

  it("allows rejection from any pre-publication stage", () => {
    for (const status of [
      "DISCOVERED",
      "RESEARCHED",
      "QUALIFIED",
      "NEEDS_PERMISSION",
      "APPROVED_FOR_OUTREACH",
    ] as const) {
      const { community } = applyTransition(
        makeCommunity({ status }),
        "REJECTED",
        { ...CTX, reason: "rules forbid any sharing" },
      );
      expect(community.status).toBe("REJECTED");
    }
  });

  it("keeps terminal statuses terminal except the guarded reopen", () => {
    expect(() =>
      applyTransition(makeCommunity({ status: "COMPLETED" }), "RESEARCHED", CTX),
    ).toThrow(TransitionError);
    expect(() =>
      applyTransition(
        makeCommunity({ status: "DO_NOT_CONTACT" }),
        "RESEARCHED",
        CTX,
      ),
    ).toThrow(TransitionError);

    const reopened = applyTransition(
      makeCommunity({ status: "REJECTED", note: "rules forbid sharing" }),
      "RESEARCHED",
      CTX,
    );
    expect(reopened.community.status).toBe("RESEARCHED");
  });

  it("throws with the legal table on unknown moves", () => {
    try {
      applyTransition(makeCommunity(), "QUALIFIED", CTX);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TransitionError);
      const message = (error as Error).message;
      expect(message).toContain("DISCOVERED -> QUALIFIED");
      expect(message).toContain("Legal moves");
      expect(message).toContain("COMPLETED -> (terminal)");
    }
  });

  it("refuses no-op transitions", () => {
    expect(() =>
      applyTransition(makeCommunity(), "DISCOVERED", CTX),
    ).toThrow(/already there/);
  });
});

describe("STATUS_ACTIONS", () => {
  it("maps every cli action to a real target status", () => {
    expect(STATUS_ACTIONS["request-permission"]).toBe("NEEDS_PERMISSION");
    expect(STATUS_ACTIONS.reopen).toBe("RESEARCHED");
    expect(Object.keys(STATUS_ACTIONS)).toHaveLength(9);
    // The follow-up stage was removed deliberately: nothing in this
    // workflow schedules a return visit.
    expect(STATUS_ACTIONS["follow-up"]).toBeUndefined();
  });
});
