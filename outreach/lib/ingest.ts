// Parse discovery results into candidates. Accepts the three line shapes
// a researcher realistically pastes:
//   1. markdown link        [Dhaka Dhikr](https://facebook.com/groups/x)
//   2. TSV                  name<TAB>url[<TAB>note]   or   url<TAB>note
//   3. bare URL             https://facebook.com/groups/x
// `#` lines are comments; malformed lines are reported with line numbers,
// never fatal. Candidates are deduplicated within the file by canonical
// dedup key.

import { canonicalize } from "./url.ts";

export interface ParsedCandidate {
  url: string;
  name: string | null;
  note: string | null;
  line: number;
  dedupKey: string;
}

export interface IngestIssue {
  line: number;
  text: string;
  reason: string;
}

export interface IngestResult {
  candidates: ParsedCandidate[];
  issues: IngestIssue[];
  duplicates: IngestIssue[];
}

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/i;

function cleanUrlTail(url: string): string {
  // Strip trailing punctuation that commonly rides along when pasting.
  return url.replace(/[.,;:!?)\]}'"]+$/u, "");
}

function extractUrl(text: string): string | null {
  const match = text.match(URL_PATTERN);
  if (!match) return null;
  return cleanUrlTail(match[0]);
}

export function parseIngest(text: string): IngestResult {
  const candidates: ParsedCandidate[] = [];
  const issues: IngestIssue[] = [];
  const duplicates: IngestIssue[] = [];
  const seen = new Map<string, number>();

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const raw = lines[i].trim();
    if (!raw || raw.startsWith("#")) continue;

    let name: string | null = null;
    let note: string | null = null;
    let url: string | null = null;

    // Shape 1: markdown link, optionally followed by a note.
    const markdown = raw.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)(?:\s*[-–—|]\s*(.*))?$/u);
    if (markdown) {
      name = markdown[1].trim();
      url = cleanUrlTail(markdown[2]);
      note = markdown[3]?.trim() ?? null;
    }

    // Shape 2: TSV cells. Cells before the URL are the name; cells
    // after it are the note (handles both name<TAB>url<TAB>note and
    // url<TAB>note).
    if (url === null && raw.includes("\t")) {
      const cells = raw.split("\t").map((cell) => cell.trim()).filter(Boolean);
      const urlIndex = cells.findIndex((cell) => URL_PATTERN.test(cell));
      if (urlIndex !== -1) {
        url = cleanUrlTail(cells[urlIndex]);
        name = urlIndex > 0 ? cells.slice(0, urlIndex).join(" ") : null;
        const noteCells = cells.slice(urlIndex + 1);
        note = noteCells.length > 0 ? noteCells.join(" ") : null;
      }
    }

    // Shape 3: bare URL anywhere in the line.
    if (url === null) {
      url = extractUrl(raw);
    }

    if (url === null) {
      issues.push({
        line: lineNumber,
        text: raw.slice(0, 120),
        reason: "no URL found",
      });
      continue;
    }

    const target = canonicalize(url);
    if (target === null) {
      issues.push({
        line: lineNumber,
        text: url,
        reason: "not a recognizable community URL",
      });
      continue;
    }

    const firstLine = seen.get(target.dedupKey);
    if (firstLine !== undefined) {
      duplicates.push({
        line: lineNumber,
        text: url,
        reason: `duplicate of line ${firstLine} (${target.dedupKey})`,
      });
      continue;
    }
    seen.set(target.dedupKey, lineNumber);

    candidates.push({
      url,
      name,
      note,
      line: lineNumber,
      dedupKey: target.dedupKey,
    });
  }

  return { candidates, issues, duplicates };
}
