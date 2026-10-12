// JSONL persistence: communities.jsonl holds current state (one record
// per line, rewritten atomically on every mutation); events.jsonl is an
// append-only audit trail. A wx-lockfile keeps CLI and board writes
// serialized; every mutation re-reads from disk under the lock.

import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import path from "node:path";

import { fnv1a32 } from "./hash.ts";
import type {
  Actor,
  Community,
  OutreachEvent,
  Platform,
} from "./types.ts";
import { canonicalize } from "./url.ts";

export class DuplicateError extends Error {
  existingId: string;
  constructor(message: string, existingId: string) {
    super(message);
    this.existingId = existingId;
  }
}

export class NotFoundError extends Error {}

export interface AddInput {
  url: string;
  name?: string;
  note?: string;
  source: string;
  actor: Actor;
  at?: Date;
}

export interface StoreHealth {
  communities: number;
  events: number;
  quarantined: number;
}

export interface StorePaths {
  communities: string;
  events: string;
  lock: string;
}

const LOCK_STALE_MS = 30_000;
const LOCK_RETRY_MS = 50;
const LOCK_TIMEOUT_MS = 2_000;

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function withLock<T>(lockPath: string, fn: () => T): T {
  const started = Date.now();
  for (;;) {
    let fd: number | null = null;
    try {
      fd = openSync(lockPath, "wx");
      try {
        writeSync(fd, String(process.pid));
        return fn();
      } finally {
        closeSync(fd);
        try {
          unlinkSync(lockPath);
        } catch {
          // Another waiter may have taken over a stale lock; releasing is
          // best-effort here and the outer loop re-checks state.
        }
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;
      try {
        const stat = statSync(lockPath);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          unlinkSync(lockPath);
          continue;
        }
      } catch {
        continue; // vanished; retry immediately
      }
      if (Date.now() - started > LOCK_TIMEOUT_MS) {
        throw new Error(
          `outreach store is locked (${lockPath}); is another cli or board run still writing?`,
        );
      }
      sleepSync(LOCK_RETRY_MS);
    }
  }
}

export function communityIdFor(dedupKey: string): string {
  const slug =
    dedupKey
      .replace(/^(fb|url):/, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 32) || "community";
  const hash = fnv1a32(dedupKey).toString(16).padStart(8, "0");
  return `${slug}-${hash}`;
}

function defaultDisplayName(dedupKey: string, platform: Platform): string {
  const rest = dedupKey.replace(/^(fb|url):/, "");
  if (platform === "facebook_page" && /^\d+$/.test(rest)) {
    return `Facebook page ${rest}`;
  }
  const name = rest.split("/").pop() ?? rest;
  return name || "Unknown community";
}

function writeAtomic(filePath: string, contents: string): void {
  const tmp = `${filePath}.tmp`;
  const fd = openSync(tmp, "w");
  try {
    writeSync(fd, contents);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(tmp, filePath);
}

function parseJsonl<T>(raw: string): { rows: T[]; badLines: number[] } {
  const rows: T[] = [];
  const badLines: number[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      rows.push(JSON.parse(line) as T);
    } catch {
      badLines.push(i + 1);
    }
  }
  return { rows, badLines };
}

export interface MergeResult {
  community: Community;
  event: OutreachEvent;
  removedId: string;
}

export class OutreachStore {
  readonly dataDir: string;
  readonly actor: Actor;

  constructor(dataDir: string, actor: Actor = "cli") {
    this.dataDir = dataDir;
    this.actor = actor;
    mkdirSync(dataDir, { recursive: true });
  }

  get paths(): StorePaths {
    return {
      communities: path.join(this.dataDir, "communities.jsonl"),
      events: path.join(this.dataDir, "events.jsonl"),
      lock: path.join(this.dataDir, ".lock"),
    };
  }

  private readCommunities(): { rows: Community[]; badLines: number[] } {
    let raw = "";
    try {
      raw = readFileSync(this.paths.communities, "utf8");
    } catch {
      return { rows: [], badLines: [] };
    }
    const { rows, badLines } = parseJsonl<Community>(raw);
    if (badLines.length > 0) {
      // Quarantine a copy, then rewrite the good lines so the store
      // heals itself instead of failing on every later load.
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const quarantine = `${this.paths.communities}.corrupt-${stamp}`;
      writeAtomic(quarantine, raw);
      writeAtomic(
        this.paths.communities,
        rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : ""),
      );
    }
    return { rows, badLines };
  }

  health(): StoreHealth {
    const { rows, badLines } = this.readCommunities();
    let events = 0;
    try {
      events = parseJsonl<OutreachEvent>(
        readFileSync(this.paths.events, "utf8"),
      ).rows.length;
    } catch {
      events = 0;
    }
    return {
      communities: rows.length,
      events,
      quarantined: badLines.length,
    };
  }

  all(): Community[] {
    return this.readCommunities().rows;
  }

  events(communityId?: string): OutreachEvent[] {
    let raw = "";
    try {
      raw = readFileSync(this.paths.events, "utf8");
    } catch {
      return [];
    }
    const { rows } = parseJsonl<OutreachEvent>(raw);
    if (!communityId) return rows;
    return rows.filter((event) => event.communityId === communityId);
  }

  get(id: string): Community {
    const found = this.all().find((row) => row.id === id);
    if (!found) {
      throw new NotFoundError(`no community with id ${id}`);
    }
    return found;
  }

  findByUrl(rawUrl: string): Community | undefined {
    const target = canonicalize(rawUrl);
    if (!target) return undefined;
    return this.all().find((row) => row.dedupKey === target.dedupKey);
  }

  private appendEvent(event: OutreachEvent): void {
    const fd = openSync(this.paths.events, "a");
    try {
      writeSync(fd, JSON.stringify(event) + "\n");
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  }

  // Add a community. Throws DuplicateError when the dedup key (or the
  // same numeric facebook group id) already exists in the store.
  add(input: AddInput): { community: Community; event: OutreachEvent } {
    const target = canonicalize(input.url);
    if (!target) {
      throw new Error(`not a recognizable community URL: ${input.url}`);
    }
    return withLock(this.paths.lock, () => {
      const rows = this.readCommunities().rows;
      const existing = rows.find((row) => row.dedupKey === target.dedupKey);
      if (existing) {
        throw new DuplicateError(
          `already in the store: ${existing.id} (${existing.displayName}, ${existing.status})`,
          existing.id,
        );
      }
      if (target.fbGroupId) {
        const sameGroup = rows.find(
          (row) => row.fbGroupId === target.fbGroupId,
        );
        if (sameGroup) {
          throw new DuplicateError(
            `a different URL form of facebook group ${target.fbGroupId} already exists: ${sameGroup.id} (${sameGroup.canonicalUrl}); consider: outreach merge ${sameGroup.id} <into-id> after review`,
            sameGroup.id,
          );
        }
      }

      const at = (input.at ?? new Date()).toISOString();
      const id = communityIdFor(target.dedupKey);
      if (rows.some((row) => row.id === id)) {
        throw new DuplicateError(
          `generated id collides with an existing record: ${id}`,
          id,
        );
      }

      const community: Community = {
        id,
        dedupKey: target.dedupKey,
        canonicalUrl: target.canonicalUrl,
        displayName: input.name?.trim() || defaultDisplayName(target.dedupKey, target.platform),
        platform: target.platform,
        status: "DISCOVERED",
        lang: "unknown",
        topic: "unknown",
        rules: "unknown",
        rulesUrl: null,
        rulesNote: null,
        members: null,
        lastPostAt: null,
        evidence: "",
        focus: "",
        fbGroupId: target.fbGroupId,
        source: input.source,
        lastVerifiedAt: null,
        postUrl: null,
        dhikrId: null,
        draft: null,
        permissionDraft: null,
        score: null,
        aliases: [],
        note: input.note?.trim() ?? "",
        createdAt: at,
        updatedAt: at,
      };

      const event: OutreachEvent = {
        at,
        actor: input.actor,
        communityId: id,
        type: "created",
        to: "DISCOVERED",
        note: input.note?.trim() || undefined,
        data: { source: input.source, url: target.canonicalUrl },
      };

      const next = [...rows, community];
      writeAtomic(
        this.paths.communities,
        next.map((row) => JSON.stringify(row)).join("\n") + "\n",
      );
      this.appendEvent(event);
      return { community, event };
    });
  }

  // Read-modify-write one community under the lock. The mutator returns
  // the updated community plus the audit event(s) to append.
  mutate(
    id: string,
    mutator: (community: Community) => {
      community: Community;
      event: OutreachEvent;
      extraEvents?: OutreachEvent[];
    },
  ): { community: Community; event: OutreachEvent } {
    return withLock(this.paths.lock, () => {
      const rows = this.readCommunities().rows;
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) throw new NotFoundError(`no community with id ${id}`);
      const { community, event, extraEvents } = mutator(rows[index]);
      const next = [...rows];
      next[index] = community;
      writeAtomic(
        this.paths.communities,
        next.map((row) => JSON.stringify(row)).join("\n") + "\n",
      );
      this.appendEvent(event);
      for (const extra of extraEvents ?? []) this.appendEvent(extra);
      return { community, event };
    });
  }

  merge(sourceId: string, intoId: string): MergeResult {
    if (sourceId === intoId) {
      throw new Error("cannot merge a community into itself");
    }
    return withLock(this.paths.lock, () => {
      const rows = this.readCommunities().rows;
      const source = rows.find((row) => row.id === sourceId);
      const into = rows.find((row) => row.id === intoId);
      if (!source) throw new NotFoundError(`no community with id ${sourceId}`);
      if (!into) throw new NotFoundError(`no community with id ${intoId}`);

      const at = new Date().toISOString();
      const merged: Community = {
        ...into,
        aliases: [...new Set([...into.aliases, source.canonicalUrl, source.displayName])],
        fbGroupId: into.fbGroupId ?? source.fbGroupId,
        members: into.members ?? source.members,
        lastPostAt: into.lastPostAt ?? source.lastPostAt,
        lang: into.lang === "unknown" ? source.lang : into.lang,
        updatedAt: at,
      };
      const event: OutreachEvent = {
        at,
        actor: this.actor,
        communityId: into.id,
        type: "merge",
        note: `merged ${source.id} (${source.dedupKey}) into ${into.id}`,
        data: {
          mergedId: source.id,
          mergedKey: source.dedupKey,
          mergedUrl: source.canonicalUrl,
        },
      };

      const next = rows
        .filter((row) => row.id !== source.id)
        .map((row) => (row.id === into.id ? merged : row));
      writeAtomic(
        this.paths.communities,
        next.map((row) => JSON.stringify(row)).join("\n") + "\n",
      );
      this.appendEvent(event);
      return { community: merged, event, removedId: source.id };
    });
  }
}
