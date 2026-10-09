import { publicDhikr } from "./index";
import { TOPICS } from "./topics";
import type { TopicId } from "./types";

/**
 * Local, deterministic content search (2026-10-08). No network, no
 * dependency — the whole index is built from the public dhikr catalog
 * and the TOPICS registry, so it works offline like everything else in
 * Amalyn. Sized for a library of tens of items: a linear scan over a
 * lazy index is deliberately chosen over any data structure.
 *
 * Matching is tolerant of spelling variation through three layers:
 * normalization (Bangla conjunct/hasant/ZWNJ folding, Latin diacritics,
 * Arabic harakat), authored aliases on each dhikr and topic (Banglish
 * transliterations like "rijik"/"rizik"), and prefix matching at
 * conservative minimum lengths so a short query like "রি" cannot flood
 * results while "রিজ" still reaches "রিজিক".
 *
 * Scores encode the ranking tiers the UI relies on:
 * exact title > exact alias > title prefix/token > alias prefix >
 * topic match > meaning text. The number itself is internal; only the
 * order of hits is contractual.
 */

export interface DhikrHit {
  kind: "dhikr";
  dhikrId: string;
  score: number;
}

export interface TopicHit {
  kind: "topic";
  topicId: TopicId;
  score: number;
}

export interface SearchResults {
  dhikrs: DhikrHit[];
  topics: TopicHit[];
}

/** Minimum query length (code points) before any search happens. */
const MIN_QUERY = 2;
/** Queries shorter than this never match by prefix — exact only. */
const MIN_PREFIX = 3;

const BANGLA = /[\u0980-\u09FF]/;
const ARABIC = /[\u0600-\u06FF]/;

const normalizeBangla = (value: string): string =>
  value
    .normalize("NFC")
    .replace(/[\u200C\u200D\u09CD]/g, "");

const normalizeLatin = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019\u02BB\u02BC]/g, "")
    .toLowerCase();

const normalizeArabic = (value: string): string =>
  value
    .normalize("NFC")
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    // Fold hamza-carrier alefs and letter variants so words match
    // regardless of orthography (أستغفر ≈ استغفر).
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A");

/** Normalize one token by whichever script it is written in. */
export const normalizeToken = (value: string): string => {
  if (BANGLA.test(value)) return normalizeBangla(value);
  if (ARABIC.test(value)) return normalizeArabic(value);
  return normalizeLatin(value);
};

export const normalizeQuery = (raw: string): string => raw.trim();

const tokenize = (value: string): string[] =>
  normalizeQuery(value)
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeToken)
    .filter(Boolean);

const uniqueTokens = (values: readonly string[]): string[] => [
  ...new Set(values.flatMap(tokenize)),
];

interface DhikrEntry {
  dhikrId: string;
  titles: string[];
  titleTokens: string[];
  aliases: string[];
  aliasTokens: string[];
  bodyTokens: string[];
  topicIds: Set<TopicId>;
  topicTokens: string[];
}

interface TopicEntry {
  topicId: TopicId;
  titles: string[];
  aliases: string[];
}

interface SearchIndex {
  dhikrs: DhikrEntry[];
  topics: TopicEntry[];
}

let index: SearchIndex | null = null;

const topicTokens = (topicId: TopicId): { titles: string[]; aliases: string[] } => {
  const topic = TOPICS.find((entry) => entry.id === topicId);
  if (!topic) return { titles: [], aliases: [] };
  return {
    titles: uniqueTokens([topic.name.en, topic.name.bn ?? ""]),
    aliases: uniqueTokens(topic.searchTerms),
  };
};

const buildIndex = (): SearchIndex => {
  const topics: TopicEntry[] = TOPICS.map((topic) => ({
    topicId: topic.id,
    titles: uniqueTokens([topic.name.en, topic.name.bn ?? ""]),
    aliases: uniqueTokens(topic.searchTerms),
  }));

  const dhikrs: DhikrEntry[] = publicDhikr().map((dhikr) => {
    const linked = dhikr.topics ?? [];
    const titleParts = [dhikr.names.en, dhikr.names.bn ?? ""];
    const titleTokens = uniqueTokens(titleParts);
    const aliasValues = [...(dhikr.searchTerms ?? []), dhikr.transliteration];
    const topicParts = linked.flatMap((entry) => {
      const parts = topicTokens(entry.topic);
      return [...parts.titles, ...parts.aliases];
    });
    return {
      dhikrId: dhikr.id,
      titles: uniqueTokens(titleParts),
      titleTokens,
      aliases: uniqueTokens(aliasValues),
      aliasTokens: uniqueTokens(aliasValues),
      bodyTokens: uniqueTokens([dhikr.meaning.en, dhikr.meaning.bn ?? ""]),
      topicIds: new Set(linked.map((entry) => entry.topic)),
      topicTokens: uniqueTokens(topicParts),
    };
  });

  return { dhikrs, topics };
};

const getIndex = (): SearchIndex => {
  if (!index) index = buildIndex();
  return index;
};

/**
 * Test hook: the index caches the environment-gated public catalog, so
 * tests that stub NODE_ENV need to rebuild it between scenarios.
 */
export function resetSearchIndex(): void {
  index = null;
}

const cpLength = (value: string): number => [...value].length;

/** Longest-prefix relation: does `token` start with `prefix`? */
const startsWith = (token: string, prefix: string): boolean =>
  token.startsWith(prefix);

const scoreAliases = (entry: { aliases: string[]; aliasTokens: string[] }, q: string, qTokens: string[]): number => {
  let best = 0;
  for (const alias of entry.aliases) {
    if (alias === q) best = Math.max(best, 95);
  }
  for (const token of entry.aliasTokens) {
    if (qTokens.includes(token)) best = Math.max(best, 75);
    else if (cpLength(q) >= MIN_PREFIX && startsWith(token, q)) best = Math.max(best, 60);
    else if (cpLength(token) >= MIN_PREFIX && startsWith(q, token)) best = Math.max(best, 55);
  }
  return best;
};

const scoreTopics = (entry: DhikrEntry, q: string, qTokens: string[]): number => {
  let best = 0;
  for (const token of entry.topicTokens) {
    if (qTokens.includes(token)) best = Math.max(best, 52);
    else if (cpLength(q) >= MIN_PREFIX && startsWith(token, q)) best = Math.max(best, 50);
    else if (cpLength(token) >= MIN_PREFIX && startsWith(q, token)) best = Math.max(best, 45);
  }
  return best;
};

const scoreDhikr = (entry: DhikrEntry, q: string, qTokens: string[]): number => {
  let best = 0;

  // 100/90: exact title, title prefix.
  for (const title of entry.titles) {
    if (title === q) best = Math.max(best, 100);
    else if (cpLength(q) >= MIN_PREFIX && startsWith(title, q)) best = Math.max(best, 90);
    else if (cpLength(title) >= MIN_PREFIX && startsWith(q, title)) best = Math.max(best, 65);
  }

  // 80/70: title token exact / prefix.
  for (const token of entry.titleTokens) {
    if (qTokens.includes(token)) best = Math.max(best, 80);
    else if (cpLength(q) >= MIN_PREFIX && startsWith(token, q)) best = Math.max(best, 70);
  }

  best = Math.max(best, scoreAliases(entry, q, qTokens));
  best = Math.max(best, scoreTopics(entry, q, qTokens));

  // 30: meaning text — weakest tier, guarded against short queries.
  if (cpLength(q) >= 4) {
    for (const token of entry.bodyTokens) {
      if (startsWith(token, q)) best = Math.max(best, 30);
    }
  }

  // Multi-token bonus: "রিজিক বৃদ্ধি" outranks a single-token graze.
  if (qTokens.length > 1) {
    const matched = qTokens.filter(
      (token) =>
        entry.titleTokens.includes(token) ||
        entry.aliasTokens.includes(token) ||
        entry.topicTokens.includes(token) ||
        entry.bodyTokens.some((body) => startsWith(body, token)),
    ).length;
    if (matched > 1) best = Math.min(best + 10, 98);
  }

  return best;
};

const scoreTopicEntry = (entry: TopicEntry, q: string, qTokens: string[]): number => {
  let best = 0;
  for (const title of entry.titles) {
    if (title === q) best = Math.max(best, 60);
    else if (cpLength(q) >= MIN_PREFIX && startsWith(title, q)) best = Math.max(best, 55);
  }
  for (const alias of entry.aliases) {
    if (alias === q) best = Math.max(best, 58);
  }
  for (const token of entry.aliases) {
    if (qTokens.includes(token)) best = Math.max(best, 52);
    else if (cpLength(q) >= MIN_PREFIX && startsWith(token, q)) {
      best = Math.max(best, 48);
    }
  }
  return best;
};

/**
 * Search the public library. Empty or sub-minimum queries return an
 * empty result; hits are sorted by score with catalog order as the
 * stable tie-break, so the same query always renders identically.
 */
export function searchContent(rawQuery: string): SearchResults {
  const q = normalizeToken(normalizeQuery(rawQuery));
  if (cpLength(q) < MIN_QUERY) return { dhikrs: [], topics: [] };
  const qTokens = q.split(/\s+/).filter(Boolean);

  const { dhikrs, topics } = getIndex();

  const catalogOrder = new Map(dhikrs.map((entry, at) => [entry.dhikrId, at]));

  const dhikrHits: DhikrHit[] = dhikrs
    .map((entry) => ({ kind: "dhikr" as const, dhikrId: entry.dhikrId, score: scoreDhikr(entry, q, qTokens) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      (catalogOrder.get(a.dhikrId) ?? 0) - (catalogOrder.get(b.dhikrId) ?? 0),
    );

  const topicHits: TopicHit[] = topics
    .map((entry) => ({ kind: "topic" as const, topicId: entry.topicId, score: scoreTopicEntry(entry, q, qTokens) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.topicId.localeCompare(b.topicId));

  return { dhikrs: dhikrHits, topics: topicHits };
}
