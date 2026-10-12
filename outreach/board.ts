// Localhost-only review board for the outreach workflow. Plain node:http,
// no dependencies. Binds 127.0.0.1 exclusively, requires a random access
// token printed at startup, and writes every change through the same
// locked store the CLI uses.
//
// Run: npm run outreach:board

import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";

import { flagValue, parseArgv } from "./lib/argv.ts";
import { challengeUrl } from "./lib/link.ts";
import { computeStats } from "./lib/stats.ts";
import { applyTransition, STATUS_ACTIONS, TransitionError } from "./lib/status.ts";
import { OutreachStore } from "./lib/store.ts";
import type { Community, OutreachStatus } from "./lib/types.ts";

const PORT = Number.parseInt(process.env.OUTREACH_BOARD_PORT ?? "4317", 10);
const HOST = "127.0.0.1";
const BODY_CAP = 65_536;

const token = randomUUID();
const dataDir = path.resolve(
  flagValue(parseArgv(process.argv.slice(2)).flags, "data-dir") ??
    process.env.OUTREACH_DATA_DIR ??
    path.join(process.cwd(), "outreach/data"),
);
const store = new OutreachStore(dataDir, "board");

// Working statuses first; archived ones render collapsed at the bottom.
const BOARD_ORDER: OutreachStatus[] = [
  "APPROVED_FOR_OUTREACH",
  "QUALIFIED",
  "NEEDS_PERMISSION",
  "RESEARCHED",
  "PUBLISHED",
  "DISCOVERED",
  "COMPLETED",
  "REJECTED",
  "DO_NOT_CONTACT",
];

const STATUS_TONE: Record<OutreachStatus, string> = {
  DISCOVERED: "#93a0c4",
  RESEARCHED: "#7ea3d8",
  QUALIFIED: "#d9a441",
  NEEDS_PERMISSION: "#c98fd6",
  APPROVED_FOR_OUTREACH: "#3fae8c",
  PUBLISHED: "#3fae8c",
  COMPLETED: "#5c8a5f",
  REJECTED: "#8a8fa3",
  DO_NOT_CONTACT: "#8a8fa3",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > BODY_CAP) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function redirect(res: ServerResponse, message: string, isError: boolean): void {
  const query = new URLSearchParams({ token, [isError ? "err" : "msg"]: message });
  res.writeHead(303, { Location: `/?${query.toString()}` });
  res.end();
}

interface CardAction {
  action: string;
  label: string;
  needsPostUrl?: boolean;
  granted?: boolean;
  tone?: string;
}

// Contextual next steps per current status.
function actionsFor(status: OutreachStatus): CardAction[] {
  switch (status) {
    case "DISCOVERED":
      return [
        { action: "research", label: "mark researched" },
        { action: "reject", label: "reject" },
        { action: "block", label: "do not contact" },
      ];
    case "RESEARCHED":
      return [
        { action: "qualify", label: "qualify" },
        { action: "reject", label: "reject" },
        { action: "block", label: "do not contact" },
      ];
    case "QUALIFIED":
      return [
        { action: "approve", label: "approve (no permission needed)" },
        { action: "request-permission", label: "permission required" },
        { action: "reject", label: "reject" },
      ];
    case "NEEDS_PERMISSION":
      return [
        { action: "approve", label: "admin granted", granted: true },
        { action: "block", label: "stop pursuing" },
        { action: "reject", label: "refused" },
      ];
    case "APPROVED_FOR_OUTREACH":
      return [
        { action: "publish", label: "published (paste post URL)", needsPostUrl: true },
        { action: "reject", label: "reject" },
      ];
    case "PUBLISHED":
      return [
        { action: "complete", label: "complete (record outcome)" },
        { action: "block", label: "do not contact again" },
      ];
    case "REJECTED":
      return [{ action: "reopen", label: "reopen (new evidence)" }];
    default:
      return [];
  }
}

function draftBlock(
  community: Community,
  kind: "draft" | "permissionDraft",
  label: string,
): string {
  const draft = community[kind];
  const open = kind === "draft" && community.status === "APPROVED_FOR_OUTREACH" ? " open" : "";
  if (draft === null) {
    return `<details${open}><summary>${label}</summary><p class="muted">not generated yet - run: npm run outreach -- draft ${escapeHtml(community.id)}</p></details>`;
  }
  const blocks = [
    draft.en ? { lang: "en", text: draft.en } : null,
    draft.bn ? { lang: "bn", text: draft.bn } : null,
  ].filter(Boolean) as { lang: string; text: string }[];
  const textareas = blocks
    .map(
      (block) => `
      <label class="langlabel">${block.lang.toUpperCase()}</label>
      <textarea name="${block.lang}" rows="9" spellcheck="false">${escapeHtml(block.text)}</textarea>`,
    )
    .join("");
  const variant = draft.edited ? "hand-edited" : `variant ${draft.variant}`;
  return `
  <details${open}><summary>${label} <span class="muted">(${variant}, generated ${draft.generatedAt.slice(0, 10)})</span></summary>
    <form method="post" action="/api/draft" class="draftform">
      <input type="hidden" name="token" value="${token}">
      <input type="hidden" name="id" value="${escapeHtml(community.id)}">
      <input type="hidden" name="kind" value="${kind}">
      ${textareas}
      <div class="row">
        <button type="button" class="copybtn">copy</button>
        <button type="submit">save edits</button>
        <span class="muted">saving marks the draft hand-edited</span>
      </div>
    </form>
  </details>`;
}

function card(community: Community): string {
  const actions = actionsFor(community.status);
  const needsPostUrl = actions.some((action) => action.needsPostUrl);
  const challenge = challengeUrl(community.dhikrId ?? "subhanallah");
  const score = community.score;
  const tone = STATUS_TONE[community.status];

  const actionButtons = actions
    .map(
      (action) =>
        `<button type="submit" name="action" value="${action.action}" ${action.tone ? `class="toned" style="--tone:${action.tone}"` : ""}>${action.label}</button>`,
    )
    .join("\n          ");

  return `
  <article class="card" style="--tone:${tone}">
    <h3>${escapeHtml(community.displayName)} <span class="badge">${escapeHtml(community.status)}</span></h3>
    <p class="meta">${escapeHtml(community.id)} &middot; ${escapeHtml(community.platform)} &middot; ${escapeHtml(community.lang)} &middot; welcome: ${escapeHtml(community.rules)} &middot; ${community.members === null ? "members unknown" : `${community.members} members`}${community.contributionPath && community.contributionPath !== "none_observed" ? ` &middot; contribute via ${escapeHtml(community.contributionPath)}` : ""} &middot; score: <strong>${score ? score.total : "unscored"}</strong></p>
    <details class="why"><summary>why it qualifies</summary>
      <p><strong>evidence:</strong> ${community.evidence ? escapeHtml(community.evidence) : "<em>none recorded</em>"}</p>
      <p><strong>focus:</strong> ${community.focus ? escapeHtml(community.focus) : "<em>none recorded (drafts need this)</em>"}</p>
      ${score ? `<ul class="reasons">${score.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>` : ""}
    </details>
    <p class="links">
      <a href="${escapeHtml(community.canonicalUrl)}" target="_blank" rel="noreferrer noopener">open community &#8599;</a>
      &nbsp;&nbsp;
      <span class="muted">challenge link:</span>
      <code class="challenge">${escapeHtml(challenge)}</code>
      <button type="button" class="copybtn" data-copytext="${escapeHtml(challenge)}">copy link</button>
    </p>
    ${draftBlock(community, "draft", "post draft")}
    ${draftBlock(community, "permissionDraft", "permission request")}
    <form method="post" action="/api/status" class="statusform">
      <input type="hidden" name="token" value="${token}">
      <input type="hidden" name="id" value="${escapeHtml(community.id)}">
      ${needsPostUrl ? '<input type="text" name="postUrl" placeholder="post URL (evidence of the actual post)">' : ""}
      <input type="text" name="note" placeholder="note / reason (required for reject, block, complete)">
      <div class="row">
        ${actionButtons}
      </div>
    </form>
  </article>`;
}

function page(message: string | null, error: string | null): string {
  const communities = store.all();
  const stats = computeStats(communities);
  const sections = BOARD_ORDER.map((status) => {
    const rows = communities
      .filter((community) => community.status === status)
      .sort((a, b) => (b.score?.total ?? -1) - (a.score?.total ?? -1));
    if (rows.length === 0) return "";
    const collapsed = status === "COMPLETED" || status === "REJECTED" || status === "DO_NOT_CONTACT";
    return `
  <section>
    <h2><span class="dot" style="background:${STATUS_TONE[status]}"></span>${status} <span class="count">${rows.length}</span></h2>
    <div class="${collapsed ? "collapsed" : ""}">${rows.map(card).join("\n")}</div>
  </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Amalyn outreach board</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px 16px 64px;
    background: #0b1020; color: #e8ecf8;
    font: 15px/1.55 -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  main { max-width: 980px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #93a0c4; margin: 0 0 20px; }
  .banner { padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }
  .banner.ok { background: #17322a; color: #7fd7b8; }
  .banner.bad { background: #38202a; color: #f0a5b8; }
  h2 { font-size: 15px; letter-spacing: 0.08em; margin: 28px 0 10px; color: #c7d0ea; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
  .count { color: #93a0c4; font-weight: normal; }
  .collapsed > .card { display: none; }
  .collapsed > .card:first-child { display: block; }
  .card {
    background: #131a30; border: 1px solid #232d4d; border-left: 3px solid var(--tone, #232d4d);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 12px;
  }
  .card h3 { margin: 0 0 6px; font-size: 16px; }
  .badge { font-size: 11px; font-weight: normal; letter-spacing: 0.06em; color: var(--tone); border: 1px solid var(--tone); border-radius: 999px; padding: 1px 8px; vertical-align: 2px; }
  .meta, .muted { color: #93a0c4; font-size: 13px; }
  .meta { margin: 0 0 8px; }
  details { margin: 8px 0; }
  summary { cursor: pointer; color: #c7d0ea; }
  .reasons { color: #93a0c4; font-size: 13px; margin: 6px 0; padding-left: 20px; }
  .links { margin: 8px 0; }
  a { color: #7ea3d8; }
  code.challenge {
    background: #0b1020; border: 1px solid #232d4d; border-radius: 6px;
    padding: 2px 6px; font-size: 12px; word-break: break-all;
  }
  textarea {
    width: 100%; background: #0b1020; color: #e8ecf8;
    border: 1px solid #232d4d; border-radius: 8px; padding: 8px 10px;
    font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .langlabel { display: block; margin: 10px 0 4px; font-size: 12px; color: #93a0c4; letter-spacing: 0.08em; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }
  button {
    background: #1c2745; color: #e8ecf8; border: 1px solid #2e3c6b;
    border-radius: 8px; padding: 6px 12px; font-size: 13px; cursor: pointer;
  }
  button:hover { background: #243154; }
  .statusform input[type="text"] {
    width: 100%; margin-top: 8px; background: #0b1020; color: #e8ecf8;
    border: 1px solid #232d4d; border-radius: 8px; padding: 7px 10px; font-size: 13px;
  }
</style>
</head>
<body>
<main>
  <h1>Amalyn outreach board</h1>
  <p class="sub">${stats.total} communities &middot; localhost only, token required</p>
  ${message ? `<div class="banner ok">${escapeHtml(message)}</div>` : ""}
  ${error ? `<div class="banner bad">${escapeHtml(error)}</div>` : ""}
  ${sections}
</main>
<script>
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("button.copybtn");
    if (!button) return;
    let text = button.dataset.copytext;
    if (!text) {
      const form = button.closest("form");
      const areas = form ? form.querySelectorAll("textarea") : [];
      text = Array.from(areas).map((area) => area.value).join("\\n\\n");
    }
    if (text) await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = "copied";
    setTimeout(() => { button.textContent = original; }, 1200);
  });
</script>
</body>
</html>`;
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${HOST}`);

  if (req.method === "GET" && url.pathname === "/") {
    if (url.searchParams.get("token") !== token) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("forbidden: open the exact URL printed by npm run outreach:board");
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(page(url.searchParams.get("msg"), url.searchParams.get("err")));
    return;
  }

  if (req.method === "POST" && (url.pathname === "/api/status" || url.pathname === "/api/draft")) {
    const body = new URLSearchParams(await readBody(req));
    if (body.get("token") !== token) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("forbidden");
      return;
    }
    const id = body.get("id") ?? "";

    if (url.pathname === "/api/draft") {
      const kind = body.get("kind") === "permissionDraft" ? "permissionDraft" : "draft";
      const en = body.get("en");
      const bn = body.get("bn");
      try {
        store.mutate(id, (current) => {
          const base = kind === "permissionDraft" ? current.permissionDraft : current.draft;
          if (base === null) {
            throw new TransitionError("no draft to edit; generate one first (npm run outreach -- draft)");
          }
          const draft = { ...base, edited: true };
          if (en !== null) draft.en = en.trim();
          if (bn !== null) draft.bn = bn.trim();
          const next: Community = { ...current, updatedAt: new Date().toISOString() };
          if (kind === "permissionDraft") next.permissionDraft = draft;
          else next.draft = draft;
          return {
            community: next,
            event: {
              at: next.updatedAt,
              actor: "board" as const,
              communityId: current.id,
              type: "draft" as const,
              note: `hand edit (${kind}) from the board`,
            },
          };
        });
        redirect(res, `draft updated for ${id}`, false);
      } catch (error) {
        redirect(res, error instanceof Error ? error.message : "update failed", true);
      }
      return;
    }

    const action = body.get("action") ?? "";
    const target = STATUS_ACTIONS[action];
    if (!target) {
      redirect(res, `unknown action "${action}"`, true);
      return;
    }
    try {
      const { community, event } = store.mutate(id, (current) =>
        applyTransition(current, target, {
          actor: "board",
          note: body.get("note") ?? undefined,
          reason: body.get("note") ?? undefined,
          postUrl: body.get("postUrl") ?? undefined,
          granted: action === "approve" && current.status === "NEEDS_PERMISSION",
        }),
      );
      redirect(res, `${community.displayName}: ${event.from} -> ${event.to}`, false);
    } catch (error) {
      const message =
        error instanceof TransitionError
          ? error.message
          : error instanceof Error && error.message.includes("no community with id")
            ? `unknown community ${id}`
            : "action failed (see the board server output)";
      redirect(res, message.split("\n")[0], true);
      if (!(error instanceof TransitionError)) {
        console.error(error);
      }
    }
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
}

const server = createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain" });
    res.end("internal error");
  });
});

server.listen(PORT, HOST, () => {
  console.log(`outreach board: http://${HOST}:${PORT}/?token=${token}`);
  console.log(`store: ${dataDir}`);
  console.log("localhost only - do not share the URL outside this machine");
});

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
