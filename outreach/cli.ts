// Community outreach CLI for Amalyn. Run via `npm run outreach -- ...`
// (which invokes node --experimental-strip-types). No dependencies.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { flagBool, flagValue, parseArgv } from "./lib/argv.ts";
import {
  challengeUrl,
  DHIKR_IDS,
  isDhikrId,
} from "./lib/link.ts";
import { computeStats } from "./lib/stats.ts";
import { fingerprint } from "./lib/hash.ts";
import { parseIngest } from "./lib/ingest.ts";
import {
  generateDraft,
  type DraftLang,
} from "./lib/drafting.ts";
import {
  nextTopic,
  QUALIFY_MIN_RULES,
  QUALIFY_MIN_TOTAL,
  QUALIFY_MIN_TOPIC,
  scoreCommunity,
} from "./lib/scoring.ts";
import {
  applyTransition,
  STATUS_ACTIONS,
  TransitionError,
} from "./lib/status.ts";
import {
  DuplicateError,
  NotFoundError,
  OutreachStore,
} from "./lib/store.ts";
import {
  CONTRIBUTION_PATHS,
  STATUSES,
  type Actor,
  type Community,
  type Lang,
  type OutreachStatus,
  type RulesStatus,
  type TopicCategory,
} from "./lib/types.ts";

const HELP = `Amalyn community outreach - share the free app with communities that welcome it.

Usage: npm run outreach -- <command> [args] [flags]

Commands:
  add <url> [--name n] [--note s] [--source s]     Register a community URL (deduped)
  discover --input <file>                          Ingest pasted results (markdown/TSV/bare URLs)
  discover --brave [--query q] [--queries-file f]  Search via Brave API (BRAVE_SEARCH_API_KEY)
  research <id> [fields]                            Record evidence; recompute score
      [--name n] [--lang en|bn|mixed|other|unknown] [--topic <category>]
      [--rules explicit_permit|approval_process|permission_required|permissive|anti_promo|unknown]
      [--rules-url u] [--rules-note s] [--members n] [--last-post YYYY-MM-DD]
      [--contribution submission_form|admin_approval|direct_contact|none_observed]
      [--contribution-note s] [--evidence s] [--focus s] [--dhikr <id>]
  draft <id> [--dhikr id] [--lang en|bn|both]      Generate the personalized post
      [--template post|permission] [--variant n] [--copy]
  permission <id>                                  Same as draft --template permission
  status <id> <action>                             Guarded transitions:
      research | qualify | request-permission | approve | publish |
      complete | reject | block | reopen
      [--post-url u] [--reason s] [--note s] [--granted]
  list [--status s] [--json]                       Queue overview
  show <id> [--json]                               Full record + event history
  stats [--json]                                   Status counts and store health
  link [--dhikr <id>]                              The plain challenge deep link for posts
  merge <source-id> <into-id>                      Consolidate a duplicate (audited)
  board                                            How to open the review board

Globals: --data-dir <dir> (default outreach/data)
Docs: outreach/README.md (operator) and outreach/PLAYBOOK.md (research runs)
`;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function parseMembers(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value < 0) {
    fail(`--members must be a non-negative integer, got "${raw}"`);
  }
  return value;
}

function parseDate(raw: string, flagName: string): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    fail(`--${flagName} must be a parseable date (YYYY-MM-DD works), got "${raw}"`);
  }
  return date.toISOString();
}

function enumFlag<T extends string>(
  raw: string | undefined,
  allowed: readonly T[],
  flagName: string,
): T | undefined {
  if (raw === undefined) return undefined;
  if (!(allowed as readonly string[]).includes(raw)) {
    fail(`--${flagName} must be one of: ${allowed.join(", ")}`);
  }
  return raw as T;
}

const LANGS: readonly Lang[] = ["en", "bn", "mixed", "other", "unknown"];
const TOPICS: readonly TopicCategory[] = [
  "adhkar",
  "daily_practice",
  "general",
  "quotes",
  "off_topic",
  "unknown",
];
const RULES: readonly RulesStatus[] = [
  "explicit_permit",
  "approval_process",
  "permission_required",
  "permissive",
  "anti_promo",
  "unknown",
];

// Fingerprints of drafts already issued to OTHER communities, so the
// generator can guarantee distinct text across the store.
function takenFingerprints(store: OutreachStore, excludeId: string): Set<string> {
  const taken = new Set<string>();
  for (const community of store.all()) {
    if (community.id === excludeId) continue;
    for (const draft of [community.draft, community.permissionDraft]) {
      if (draft === null) continue;
      const text = [draft.en, draft.bn].filter(Boolean).join("\n---\n");
      if (text) taken.add(fingerprint(text));
    }
  }
  return taken;
}

function copyToClipboard(text: string): void {
  const result = spawnSync("pbcopy", { input: text });
  if (result.status === 0) {
    console.log("(copied to clipboard)");
  } else {
    console.error("(clipboard copy failed; select and copy the text above)");
  }
}

function printCommunityLine(community: Community): void {
  const score = community.score?.total ?? "--";
  const status = community.status.padEnd(20);
  console.log(`${community.id}  ${status}  ${String(score).padStart(3)}  ${community.lang.padEnd(6)}  ${community.displayName}`);
}

function shortIdHint(store: OutreachStore): never {
  console.error("known ids:");
  for (const community of store.all()) printCommunityLine(community);
  process.exit(1);
}

function requireCommunity(store: OutreachStore, id: string): Community {
  try {
    return store.get(id);
  } catch {
    console.error(`error: no community with id "${id}"`);
    shortIdHint(store);
  }
}

async function discoverBrave(
  store: OutreachStore,
  query: string,
  limit: number,
): Promise<void> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${Math.min(Math.max(limit, 1), 20)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY ?? "",
      },
    });
  } catch (error) {
    console.error(`brave request failed for "${query}": ${String(error)}`);
    return;
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(
      `brave returned ${response.status} for "${query}" ${body.slice(0, 200)}`,
    );
    return;
  }
  const data = (await response.json()) as {
    web?: { results?: { title: string; url: string; description: string }[] };
  };
  const results = data.web?.results ?? [];
  const text = results
    .map((result) => `${result.title}\t${result.url}\t${result.description}`)
    .join("\n");
  const parsed = parseIngest(text);
  let added = 0;
  for (const candidate of parsed.candidates) {
    try {
      const { community } = store.add({
        url: candidate.url,
        name: candidate.name ?? undefined,
        note: candidate.note ?? undefined,
        source: `brave:${query}`,
        actor: "cli",
      });
      console.log(`  + ${community.id}  ${community.displayName}`);
      added++;
    } catch (error) {
      if (error instanceof DuplicateError) {
        console.log(`  = already stored (${error.existingId})`);
      } else {
        console.error(`  ! ${candidate.url}: ${String(error)}`);
      }
    }
  }
  if (parsed.issues.length > 0) {
    console.log(`  (${parsed.issues.length} unusable results skipped)`);
  }
  console.log(`  query "${query}": ${added} new`);
}

// Rotates the v2 discovery-intent families (see outreach/PLAYBOOK.md).
// Brave's engine handles site: operators correctly; the operator-facing
// playbook documents the quoted-URL fallback for engines that do not.
const DEFAULT_BRAVE_QUERIES = [
  "site:facebook.com/groups dhikr challenge accountability",
  "site:facebook.com/groups muslim habit accountability",
  "site:facebook.com/groups worship consistency challenge",
  "site:facebook.com/groups quran reading challenge",
  "site:facebook.com/groups muslim students association",
  "site:facebook.com/groups islamic productivity personal development",
  "site:facebook.com/groups জিকির চ্যালেঞ্জ",
  "site:facebook.com/groups আমল চ্যালেঞ্জ",
];

async function main(): Promise<void> {
  const parsed = parseArgv(process.argv.slice(2));
  const [command, ...positionals] = parsed.positionals;
  const { flags } = parsed;

  const dataDir = flagValue(flags, "data-dir") ?? path.resolve(process.cwd(), "outreach/data");
  const store = new OutreachStore(dataDir, "cli");
  const actor: Actor = "cli";
  const json = flagBool(flags, "json");

  if (command === undefined || command === "help") {
    console.log(HELP);
    return;
  }

  if (command === "add") {
    const url = positionals[0];
    if (!url) fail("usage: outreach add <url> [--name n] [--note s] [--source s]");
    try {
      const { community } = store.add({
        url,
        name: flagValue(flags, "name"),
        note: flagValue(flags, "note"),
        source: flagValue(flags, "source") ?? "manual",
        actor,
      });
      console.log(`added ${community.id}`);
      console.log(`  ${community.canonicalUrl}`);
      console.log(`  key: ${community.dedupKey}`);
      console.log("next: outreach research <id> --evidence ... --focus ...");
    } catch (error) {
      if (error instanceof DuplicateError) {
        console.log(`skipped: ${error.message}`);
        return;
      }
      throw error;
    }
    return;
  }

  if (command === "discover") {
    const inputFile = flagValue(flags, "input");
    const brave = flagBool(flags, "brave");
    if (!inputFile && !brave) {
      fail("usage: outreach discover --input <file>  or  discover --brave [--query q]");
    }

    if (inputFile) {
      let text: string;
      try {
        text = readFileSync(inputFile, "utf8");
      } catch {
        fail(`cannot read ${inputFile}`);
      }
      const result = parseIngest(text);
      const source = `file:${path.basename(inputFile)}`;
      let added = 0;
      for (const candidate of result.candidates) {
        try {
          const { community } = store.add({
            url: candidate.url,
            name: candidate.name ?? undefined,
            note: candidate.note ?? undefined,
            source,
            actor,
          });
          console.log(`  + ${community.id}  ${community.displayName}`);
          added++;
        } catch (error) {
          if (error instanceof DuplicateError) {
            console.log(`  = ${candidate.url} already stored (${error.existingId})`);
          } else {
            console.error(`  ! ${candidate.url}: ${String(error)}`);
          }
        }
      }
      for (const issue of result.issues) {
        console.log(`  ! line ${issue.line}: ${issue.reason} (${issue.text})`);
      }
      console.log(
        `discover: ${added} added, ${result.duplicates.length} in-file duplicates, ${result.issues.length} issues`,
      );
      return;
    }

    const key = process.env.BRAVE_SEARCH_API_KEY;
    if (!key) {
      fail(
        "BRAVE_SEARCH_API_KEY is not set. Brave's free tier (2,000 queries/month) works well: " +
          "create a key at https://brave.com/search/api/ and export BRAVE_SEARCH_API_KEY. " +
          "Meanwhile use: outreach discover --input <file>, or the agent playbook in outreach/PLAYBOOK.md.",
      );
    }
    const query = flagValue(flags, "query");
    const queriesFile = flagValue(flags, "queries-file");
    const limitRaw = Number.parseInt(flagValue(flags, "limit") ?? "10", 10);
    const limit = Number.isNaN(limitRaw) ? 10 : limitRaw;
    const queries: string[] = [];
    if (query) queries.push(query);
    if (queriesFile) {
      const lines = readFileSync(queriesFile, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));
      queries.push(...lines);
    }
    if (queries.length === 0) queries.push(...DEFAULT_BRAVE_QUERIES);

    for (const [index, oneQuery] of queries.entries()) {
      if (index > 0) {
        // Free tier allows 1 request per second.
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
      await discoverBrave(store, oneQuery, limit);
    }
    return;
  }

  if (command === "research") {
    const id = positionals[0];
    if (!id) fail("usage: outreach research <id> [--evidence s] ...");
    requireCommunity(store, id);
    const evidence = flagValue(flags, "evidence");
    const focus = flagValue(flags, "focus");
    const name = flagValue(flags, "name");
    const lang = enumFlag(flagValue(flags, "lang"), LANGS, "lang");
    const topic = enumFlag(flagValue(flags, "topic"), TOPICS, "topic");
    const rules = enumFlag(flagValue(flags, "rules"), RULES, "rules");
    const rulesUrl = flagValue(flags, "rules-url");
    const rulesNote = flagValue(flags, "rules-note");
    const contribution = enumFlag(
      flagValue(flags, "contribution"),
      CONTRIBUTION_PATHS,
      "contribution",
    );
    const contributionNote = flagValue(flags, "contribution-note");
    const members = parseMembers(flagValue(flags, "members"));
    const lastPost = flagValue(flags, "last-post");
    const dhikr = flagValue(flags, "dhikr");
    if (dhikr !== undefined && !isDhikrId(dhikr)) {
      fail(`--dhikr must be one of: ${DHIKR_IDS.join(", ")}`);
    }

    const { community: updated } = store.mutate(id, (current) => {
      const next: Community = {
        ...current,
        updatedAt: new Date().toISOString(),
      };
      if (name !== undefined) next.displayName = name;
      if (evidence !== undefined) next.evidence = evidence;
      if (focus !== undefined) next.focus = focus;
      if (lang !== undefined) next.lang = lang;
      if (rules !== undefined) next.rules = rules;
      if (rulesUrl !== undefined) next.rulesUrl = rulesUrl;
      if (rulesNote !== undefined) next.rulesNote = rulesNote;
      if (contribution !== undefined) next.contributionPath = contribution;
      if (contributionNote !== undefined) next.contributionNote = contributionNote;
      if (members !== null) next.members = members;
      if (lastPost === "none") {
        // Explicit clearing: an earlier date that turns out to be
        // unobservable must be retractable, not sticky.
        next.lastPostAt = null;
      } else if (lastPost !== undefined) {
        next.lastPostAt = parseDate(lastPost, "last-post");
      }
      if (dhikr !== undefined) next.dhikrId = dhikr;
      next.topic = nextTopic(
        current.topic,
        topic,
        evidence !== undefined || name !== undefined
          ? `${name ?? current.displayName} ${evidence ?? ""} ${current.note}`
          : undefined,
      );
      next.lastVerifiedAt = new Date().toISOString();
      const breakdown = scoreCommunity(next);
      next.score = breakdown;
      const event = {
        at: next.updatedAt,
        actor,
        communityId: current.id,
        type: "research" as const,
        note: evidence,
        data: {
          score: breakdown.total,
          topic: next.topic,
          lang: next.lang,
          rules: next.rules,
          contribution: next.contributionPath ?? null,
        },
      };
      // Recording evidence is exactly the DISCOVERED -> RESEARCHED guard,
      // so advance in the same audited write instead of asking for a
      // second command.
      if (current.status === "DISCOVERED" && next.evidence.trim()) {
        const transition = applyTransition(next, "RESEARCHED", {
          actor,
          note: "advanced by research (evidence recorded)",
        });
        return { community: transition.community, event, extraEvents: [transition.event] };
      }
      return { community: next, event };
    });

    const breakdown = updated.score;
    console.log(`researched ${updated.id} (${updated.displayName})`);
    for (const reason of breakdown?.reasons ?? []) {
      console.log(`  ${reason}`);
    }
    const gates = breakdown?.gates;
    if (gates && gates.total && gates.topic && gates.rules) {
      console.log(`gates pass (total ${breakdown?.total}) -> outreach status ${id} qualify`);
    } else {
      console.log(
        `gates not met yet (total ${breakdown?.total}; topic>=${QUALIFY_MIN_TOPIC}, welcome>=${QUALIFY_MIN_RULES}, total>=${QUALIFY_MIN_TOTAL} required)`,
      );
    }
    if (!updated.focus) {
      console.log(
        "note: set --focus \"<short focus phrase>\" before drafting; drafts never invent one",
      );
    }
    return;
  }

  if (command === "draft" || command === "permission") {
    const id = positionals[0];
    if (!id) fail(`usage: outreach ${command} <id> [--dhikr id] [--lang en|bn|both] [--variant n] [--copy]`);
    const community = requireCommunity(store, id);
    const template: "post" | "permission" =
      command === "permission"
        ? "permission"
        : enumFlag(flagValue(flags, "template"), ["post", "permission"] as const, "template") ?? "post";
    const dhikr = flagValue(flags, "dhikr");
    if (dhikr !== undefined && !isDhikrId(dhikr)) {
      fail(`--dhikr must be one of: ${DHIKR_IDS.join(", ")}`);
    }
    const langFlag = flagValue(flags, "lang");
    if (langFlag !== undefined && !["en", "bn", "both"].includes(langFlag)) {
      fail("--lang must be en, bn or both");
    }
    const langs: DraftLang[] | undefined =
      langFlag === "both" ? ["en", "bn"]
      : langFlag === "en" ? ["en"]
      : langFlag === "bn" ? ["bn"]
      : undefined;
    const variantFlag = flagValue(flags, "variant");
    const parsedVariant =
      variantFlag === undefined ? undefined : Number.parseInt(variantFlag, 10);
    if (parsedVariant !== undefined && Number.isNaN(parsedVariant)) {
      fail(`--variant must be a number, got "${variantFlag}"`);
    }

    const prevDraft = template === "permission" ? community.permissionDraft : community.draft;
    if (prevDraft?.edited) {
      console.log("note: overwriting a hand-edited draft; the edited flag resets and this generation is recorded in the audit log");
    }

    const generated = generateDraft({
      community,
      template,
      dhikrId: dhikr ?? null,
      langs,
      variant: parsedVariant,
      taken: takenFingerprints(store, id),
    });

    const { community: updated } = store.mutate(id, (current) => {
      const base = template === "permission" ? current.permissionDraft : current.draft;
      const next: Community = {
        ...current,
        updatedAt: new Date().toISOString(),
      };
      const stored = {
        // Unrendered languages keep any previously generated text.
        en: generated.en ?? base?.en ?? null,
        bn: generated.bn ?? base?.bn ?? null,
        variant: generated.variant,
        generatedAt: new Date().toISOString(),
        edited: false,
      };
      if (template === "permission") next.permissionDraft = stored;
      else next.draft = stored;
      return {
        community: next,
        event: {
          at: next.updatedAt,
          actor,
          communityId: current.id,
          type: "draft" as const,
          note: `${template} draft v${generated.variant}`,
          data: {
            template,
            variant: generated.variant,
            fingerprint: generated.fingerprint,
          },
        },
      };
    });

    const stored = template === "permission" ? updated.permissionDraft : updated.draft;
    console.log(`--- ${template} draft for ${updated.displayName} (variant ${generated.variant}) ---`);
    if (stored?.en) console.log(`[EN]\n${stored.en}\n`);
    if (stored?.bn) console.log(`[BN]\n${stored.bn}\n`);
    if (flagBool(flags, "copy")) {
      const text = stored?.en ?? stored?.bn;
      if (text) copyToClipboard(text);
    }
    return;
  }

  if (command === "status") {
    const [id, action] = positionals;
    if (!id || !action) {
      fail(
        `usage: outreach status <id> <action>   actions: ${Object.keys(STATUS_ACTIONS).join(", ")}`,
      );
    }
    const target = STATUS_ACTIONS[action];
    if (!target) {
      fail(`unknown action "${action}". actions: ${Object.keys(STATUS_ACTIONS).join(", ")}`);
    }
    try {
      const { community, event } = store.mutate(id, (current) =>
        applyTransition(current, target, {
          actor,
          reason: flagValue(flags, "reason"),
          note: flagValue(flags, "note"),
          postUrl: flagValue(flags, "post-url"),
          granted: flagBool(flags, "granted"),
        }),
      );
      console.log(`${event.from} -> ${event.to}: ${community.displayName} (${community.id})`);
      if (event.note) console.log(`  note: ${event.note}`);
    } catch (error) {
      if (error instanceof NotFoundError) fail(error.message);
      throw error;
    }
    return;
  }

  if (command === "list") {
    let rows = store.all();
    const statusFlag = enumFlag(flagValue(flags, "status"), STATUSES, "status");
    if (statusFlag) rows = rows.filter((row) => row.status === statusFlag);
    if (json) {
      console.log(JSON.stringify(rows, null, 2));
      return;
    }
    if (rows.length === 0) {
      console.log("nothing matches; add some with: outreach add <url> or discover --input <file>");
      return;
    }
    for (const row of rows) printCommunityLine(row);
    return;
  }

  if (command === "show") {
    const id = positionals[0];
    if (!id) fail("usage: outreach show <id>");
    const community = requireCommunity(store, id);
    if (json) {
      console.log(JSON.stringify({ community, events: store.events(id) }, null, 2));
      return;
    }
    console.log(JSON.stringify(community, null, 2));
    console.log("--- events ---");
    for (const event of store.events(id).slice(-10)) {
      console.log(
        `${event.at.slice(0, 16)}  ${event.type}${event.to ? ` -> ${event.to}` : ""}${event.note ? `  ${event.note}` : ""}`,
      );
    }
    return;
  }

  if (command === "stats") {
    const stats = computeStats(store.all());
    if (json) {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }
    console.log(`communities by status (${stats.total} total)`);
    for (const status of Object.keys(stats.counts) as OutreachStatus[]) {
      const count = stats.counts[status];
      const bar = "#".repeat(Math.min(count, 40));
      console.log(`  ${status.padEnd(22)} ${String(count).padStart(4)}  ${bar}`);
    }
    const health = store.health();
    console.log(
      `store: ${health.communities} communities, ${health.events} events, ${health.quarantined} corrupt lines quarantined`,
    );
    return;
  }

  if (command === "link") {
    const dhikr = flagValue(flags, "dhikr") ?? "subhanallah";
    if (!isDhikrId(dhikr)) {
      fail(`--dhikr must be one of: ${DHIKR_IDS.join(", ")}`);
    }
    console.log(challengeUrl(dhikr));
    return;
  }

  if (command === "merge") {
    const [sourceId, intoId] = positionals;
    if (!sourceId || !intoId) fail("usage: outreach merge <source-id> <into-id>");
    requireCommunity(store, sourceId);
    requireCommunity(store, intoId);
    const { community, removedId } = store.merge(sourceId, intoId);
    console.log(`merged ${removedId} into ${community.id}`);
    console.log(`kept: ${community.id}  ${community.displayName}`);
    return;
  }

  if (command === "board") {
    console.log("run: npm run outreach:board");
    console.log("(a localhost-only review board; it never binds to a public interface)");
    return;
  }

  console.error(`error: unknown command "${command}"`);
  console.log(HELP);
  process.exit(2);
}

main().catch((error) => {
  // Guard violations and expected operator mistakes get clean messages;
  // genuine bugs keep their stack.
  if (error instanceof TransitionError) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});
