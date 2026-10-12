import { mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { communityIdFor, DuplicateError, NotFoundError, OutreachStore } from "./store.ts";

let dirs: string[] = [];

function makeStore(): OutreachStore {
  const dir = mkdtempSync(path.join(tmpdir(), "outreach-store-"));
  dirs.push(dir);
  return new OutreachStore(dir, "cli");
}

afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

describe("add", () => {
  it("creates a DISCOVERED record and a created event", () => {
    const store = makeStore();
    const { community, event } = store.add({
      url: "https://www.facebook.com/groups/DhakaDhikrFamily/about?fbclid=x",
      name: "Dhaka Dhikr Family",
      source: "test",
      actor: "cli",
    });
    expect(community.status).toBe("DISCOVERED");
    expect(community.dedupKey).toBe("fb:group:dhakadhikrfamily");
    expect(community.displayName).toBe("Dhaka Dhikr Family");
    expect(community.source).toBe("test");
    expect(event.type).toBe("created");

    // State file and audit file are both on disk and well-formed.
    const lines = readFileSync(store.paths.communities, "utf8").trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]).id).toBe(community.id);
    expect(store.events()).toHaveLength(1);
  });

  it("rejects the same dedup key regardless of URL spelling", () => {
    const store = makeStore();
    store.add({ url: "https://facebook.com/groups/TestGroup", source: "test", actor: "cli" });
    expect(() =>
      store.add({
        url: "https://m.facebook.com/groups/testgroup/?mibextid=zzz",
        source: "test",
        actor: "cli",
      }),
    ).toThrow(DuplicateError);
  });

  it("cross-checks numeric group ids across URL forms", () => {
    const store = makeStore();
    store.add({
      url: "https://facebook.com/groups/1122334455",
      source: "test",
      actor: "cli",
    });
    expect(() =>
      store.add({
        url: "https://www.facebook.com/groups/1122334455/about",
        source: "test",
        actor: "cli",
      }),
    ).toThrow(DuplicateError);
  });

  it("rejects unrecognizable URLs", () => {
    const store = makeStore();
    expect(() =>
      store.add({ url: "https://facebook.com/watch/?v=1", source: "test", actor: "cli" }),
    ).toThrow(/not a recognizable community URL/);
  });
});

describe("mutate", () => {
  it("applies a change and appends the audit event", () => {
    const store = makeStore();
    const { community } = store.add({
      url: "https://facebook.com/groups/TestGroup",
      source: "test",
      actor: "cli",
    });
    const { community: updated, event } = store.mutate(
      community.id,
      (row) => ({
        community: { ...row, lang: "bn", topic: "adhkar", updatedAt: row.updatedAt },
        event: {
          at: new Date().toISOString(),
          actor: "cli",
          communityId: row.id,
          type: "research",
          note: "recorded language and topic",
        },
      }),
    );
    expect(updated.lang).toBe("bn");
    expect(event.type).toBe("research");
    expect(store.get(community.id).lang).toBe("bn");
    expect(store.events(community.id)).toHaveLength(2);
  });

  it("throws NotFoundError for unknown ids", () => {
    const store = makeStore();
    expect(() => store.get("nope")).toThrow(NotFoundError);
  });

  it("appends extraEvents alongside the primary event", () => {
    const store = makeStore();
    const { community } = store.add({
      url: "https://facebook.com/groups/TestGroup",
      source: "test",
      actor: "cli",
    });
    store.mutate(community.id, (row) => ({
      community: { ...row, status: "RESEARCHED", evidence: "seen in public posts" },
      event: {
        at: row.updatedAt,
        actor: "cli",
        communityId: row.id,
        type: "research",
        note: "recorded",
      },
      extraEvents: [
        {
          at: row.updatedAt,
          actor: "cli",
          communityId: row.id,
          type: "status_change",
          from: "DISCOVERED",
          to: "RESEARCHED",
        },
      ],
    }));
    expect(store.events(community.id)).toHaveLength(3);
    const statuses = store
      .events(community.id)
      .map((event) => event.type);
    expect(statuses).toEqual(["created", "research", "status_change"]);
  });
});

describe("corruption handling", () => {
  it("quarantines a corrupt trailing line and heals the store file", () => {
    const store = makeStore();
    const { community } = store.add({
      url: "https://facebook.com/groups/TestGroup",
      source: "test",
      actor: "cli",
    });
    // Simulate a torn write: append garbage to the state file.
    const raw = readFileSync(store.paths.communities, "utf8");
    writeFileSync(store.paths.communities, raw + '{"id": "torn', "utf8");

    const health = store.health();
    expect(health.quarantined).toBe(1);
    expect(health.communities).toBe(1);

    // The store healed itself: the good record survives and the corrupt
    // copy exists alongside.
    expect(store.get(community.id).id).toBe(community.id);
    const quarantine = readdirSync(store.dataDir).find((name) =>
      name.startsWith("communities.jsonl.corrupt-"),
    );
    expect(quarantine).toBeDefined();
    expect(readFileSync(path.join(store.dataDir, quarantine as string), "utf8")).toContain(
      '{"id": "torn',
    );
    // The live file no longer contains the bad line.
    expect(readFileSync(store.paths.communities, "utf8")).not.toContain("torn");
  });
});

describe("locking", () => {
  it("takes over a stale lock instead of failing", () => {
    const store = makeStore();
    const staleTime = new Date(Date.now() - 60_000);
    writeFileSync(store.paths.lock, "99999");
    utimesSync(store.paths.lock, staleTime, staleTime);
    const { community } = store.add({
      url: "https://facebook.com/groups/TestGroup",
      source: "test",
      actor: "cli",
    });
    expect(community.status).toBe("DISCOVERED");
    expect(existsSync(store.paths.lock)).toBe(false);
  });

  it("serializes writes so concurrent mutations both land", () => {
    const store = makeStore();
    const { community } = store.add({
      url: "https://facebook.com/groups/TestGroup",
      source: "test",
      actor: "cli",
    });
    store.mutate(community.id, (row) => ({
      community: { ...row, note: "first" },
      event: { at: row.updatedAt, actor: "cli", communityId: row.id, type: "note", note: "first" },
    }));
    store.mutate(community.id, (row) => ({
      community: { ...row, note: `${row.note} second` },
      event: { at: row.updatedAt, actor: "cli", communityId: row.id, type: "note", note: "second" },
    }));
    expect(store.get(community.id).note).toBe("first second");
    expect(store.events(community.id)).toHaveLength(3);
  });
});

describe("merge", () => {
  it("consolidates a duplicate and keeps the audit trail", () => {
    const store = makeStore();
    const a = store.add({ url: "https://facebook.com/groups/AlphaDhikr", source: "test", actor: "cli" }).community;
    const b = store.add({ url: "https://facebook.com/groups/BetaDhikr", source: "test", actor: "cli" }).community;
    store.mutate(b.id, (row) => ({
      community: { ...row, lang: "bn", members: 4200 },
      event: { at: row.updatedAt, actor: "cli", communityId: row.id, type: "research", note: "researched" },
    }));

    const { community, removedId } = store.merge(a.id, b.id);
    expect(removedId).toBe(a.id);
    expect(community.aliases).toContain("https://facebook.com/groups/AlphaDhikr");
    expect(community.members).toBe(4200);
    expect(store.all().map((row) => row.id)).toEqual([b.id]);
    const mergeEvent = store.events(b.id).find((event) => event.type === "merge");
    expect(mergeEvent?.data?.mergedId).toBe(a.id);
    expect(mergeEvent?.data?.mergedKey).toBe("fb:group:alphadhikr");
  });

  it("refuses merging a community into itself", () => {
    const store = makeStore();
    const { community } = store.add({
      url: "https://facebook.com/groups/TestGroup",
      source: "test",
      actor: "cli",
    });
    expect(() => store.merge(community.id, community.id)).toThrow(/itself/);
  });
});

describe("communityIdFor", () => {
  it("is stable and filesystem-safe", () => {
    expect(communityIdFor("fb:group:TestGroup")).toBe(
      communityIdFor("fb:group:TestGroup"),
    );
    expect(communityIdFor("url:example.org/some/path")).toMatch(
      /^[a-z0-9-]+-[0-9a-f]{8}$/,
    );
  });
});
