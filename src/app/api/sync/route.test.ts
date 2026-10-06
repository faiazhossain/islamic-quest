import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_USER_EVENTS } from "@/lib/event-validation";

/**
 * Mutable state the mocked modules read at call time. vi.mock factories
 * are hoisted, so the state lives in vi.hoisted closure.
 */
const state = vi.hoisted(() => ({
  enabled: true,
  session: undefined as unknown,
  sql: undefined as unknown,
}));

vi.mock("@/auth", () => ({
  get authEnabled() {
    return state.enabled;
  },
  auth: async () => state.session,
}));

vi.mock("@/lib/server/db", () => ({
  getSql: () => state.sql,
}));

import { DELETE, GET, POST } from "./route";

const ORIGIN = "http://amalyn.test";

interface RecordedQuery {
  text: string;
  values: unknown[];
}

/**
 * A stand-in for the postgres.js tagged-template client: records every
 * query, answers the count check and the snapshot SELECT from arguments.
 */
function makeSql(rowCount: number, snapshot: unknown[] = []) {
  const queries: RecordedQuery[] = [];
  const rowBatches: unknown[][] = [];
  const fn = (first: unknown, ...rest: unknown[]) => {
    if (Array.isArray(first) && (first as unknown as { raw?: unknown }).raw !== undefined) {
      const text = (first as unknown as string[]).join(" | ");
      queries.push({ text, values: rest });
      if (text.includes("INSERT")) return Promise.resolve([]);
      if (text.includes("count(")) {
        return Promise.resolve([{ count: rowCount }]);
      }
      return Promise.resolve(snapshot);
    }
    // Helper form: sql(rows) inside the insert template.
    rowBatches.push(first as unknown[]);
    return Promise.resolve([]);
  };
  return { fn, queries, rowBatches };
}

const signedIn = (userKey: string) => ({
  user: { email: "user@example.com", userKey },
});

const post = (body: string, headers: Record<string, string> = {}): Request =>
  new Request(`${ORIGIN}/api/sync`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // Host is a forbidden header for undici Requests; the forwarded form
      // exercises the same comparison branch isSameOrigin reads.
      "x-forwarded-host": "amalyn.test",
      origin: ORIGIN,
      ...headers,
    },
    body,
  });

const validEvent = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "increment",
  questId: "subhanallah-33",
  delta: 1,
  at: Date.now() - 1000,
};

beforeEach(() => {
  vi.clearAllMocks();
  state.enabled = true;
});

describe("POST /api/sync", () => {
  it("returns 503 while sync is not configured", async () => {
    state.enabled = false;
    const response = await POST(post(JSON.stringify({ events: [] })));
    expect(response.status).toBe(503);
  });

  it("returns 403 for a cross-site origin before touching auth or the database", async () => {
    const sql = makeSql(0);
    state.sql = sql.fn;
    state.session = signedIn("k1");
    const response = await POST(
      post(JSON.stringify({ events: [] }), { origin: "https://evil.example" }),
    );
    expect(response.status).toBe(403);
    expect(sql.queries).toHaveLength(0);
  });

  it("returns 401 without a session-derived user key", async () => {
    state.sql = makeSql(0).fn;
    state.session = { user: { email: "user@example.com" } };
    const response = await POST(post(JSON.stringify({ events: [] })));
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON and for events outside the contract", async () => {
    state.sql = makeSql(0).fn;
    state.session = signedIn("k2");

    const malformed = await POST(post("{not json"));
    expect(malformed.status).toBe(400);

    const tampered = await POST(
      post(
        JSON.stringify({
          events: [{ ...validEvent, delta: 1, type: "undo" }],
        }),
      ),
    );
    expect(tampered.status).toBe(400);

    const unknownQuest = await POST(
      post(JSON.stringify({ events: [{ ...validEvent, questId: "made-up" }] })),
    );
    expect(unknownQuest.status).toBe(400);
  });

  it("returns 409 and writes nothing once the per-user abuse cap is reached", async () => {
    const sql = makeSql(MAX_USER_EVENTS);
    state.sql = sql.fn;
    state.session = signedIn("k3");
    const response = await POST(
      post(JSON.stringify({ events: [validEvent] })),
    );
    expect(response.status).toBe(409);
    expect(
      sql.queries.some((query) => query.text.includes("INSERT")),
    ).toBe(false);
  });

  it("accepts a valid batch, stores it under the session user key, and returns the snapshot", async () => {
    const snapshot = [
      { id: validEvent.id, type: "increment", questId: "subhanallah-33", delta: 1, at: validEvent.at },
    ];
    const sql = makeSql(0, snapshot);
    state.sql = sql.fn;
    state.session = signedIn("k4");
    const response = await POST(
      post(JSON.stringify({ events: [validEvent] })),
    );
    expect(response.status).toBe(200);
    const data = (await response.json()) as { synced: string[]; serverEvents: unknown[] };
    expect(data.synced).toEqual([validEvent.id]);
    expect(data.serverEvents).toEqual(snapshot);

    const insert = sql.queries.find((query) => query.text.includes("INSERT"));
    expect(insert).toBeDefined();
    expect(sql.rowBatches).toHaveLength(1);
    const rows = sql.rowBatches[0] as Array<Record<string, unknown>>;
    expect(rows[0].user_key).toBe("k4");
    expect(rows[0].quest_id).toBe(validEvent.questId);
  });

  it("rate limits pushes per user", async () => {
    state.sql = makeSql(0).fn;
    const userKey = "rate-limited-user";
    state.session = signedIn(userKey);
    // The limiter counts every request; thirty junk pushes exhaust the window.
    for (let index = 0; index < 30; index += 1) {
      await POST(post("junk"));
    }
    const response = await POST(
      post(JSON.stringify({ events: [validEvent] })),
    );
    expect(response.status).toBe(429);
  });
});

describe("DELETE /api/sync", () => {
  it("returns 401 when signed out", async () => {
    state.sql = makeSql(0).fn;
    state.session = undefined;
    const response = await DELETE(
      new Request(`${ORIGIN}/api/sync`, {
        method: "DELETE",
        headers: { "x-forwarded-host": "amalyn.test", origin: ORIGIN },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 for a cross-site origin", async () => {
    state.sql = makeSql(0).fn;
    state.session = signedIn("k5");
    const response = await DELETE(
      new Request(`${ORIGIN}/api/sync`, {
        method: "DELETE",
        headers: {
          "x-forwarded-host": "amalyn.test",
          origin: "https://evil.example",
        },
      }),
    );
    expect(response.status).toBe(403);
  });

  it("deletes only the signed-in user's rows", async () => {
    const sql = makeSql(0);
    state.sql = sql.fn;
    state.session = signedIn("k6");
    const response = await DELETE(
      new Request(`${ORIGIN}/api/sync`, {
        method: "DELETE",
        headers: { "x-forwarded-host": "amalyn.test", origin: ORIGIN },
      }),
    );
    expect(response.status).toBe(200);
    const del = sql.queries.find((query) => query.text.includes("DELETE"));
    expect(del).toBeDefined();
    expect(del?.values).toEqual(["k6"]);
  });
});

describe("GET /api/sync", () => {
  it("probes capability and reports the signed-in account", async () => {
    state.session = signedIn("k7");
    const response = await GET();
    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      enabled: boolean;
      signedIn: boolean;
      email: string | null;
    };
    expect(data).toEqual({
      enabled: true,
      signedIn: true,
      email: "user@example.com",
    });
  });

  it("never exposes the pseudonymous user key", async () => {
    state.session = signedIn("secret-key");
    const response = await GET();
    const body = await response.text();
    expect(body).not.toContain("secret-key");
  });
});
