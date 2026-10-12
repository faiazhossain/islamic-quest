# Amalyn community outreach (operator tooling)

A repeatable, auditable workflow for discovering Muslim communities
worldwide that could benefit from Amalyn's regular-amal feature and
sharing the free app with the ones that welcome it.

The mission is narrow: help people practice amal and make Amalyn freely
available. This tooling supports exactly that - research, permission
verification, post preparation, and a minimal record of where a post
was already shared so nothing is posted twice. It deliberately does
not schedule follow-ups, solicit community feedback (Amalyn has an
in-app feedback section), or measure clicks, funnels, or engagement.

This is operator tooling, not app code: it never ships in the bundle and
never touches app or worship data.

## Hard rules (encoded in the tool)

- **No automated posting, ever.** Meta removed the Groups API
  (`publish_to_groups`) on 2024-04-22; group posting is manual
  copy-paste, and `PUBLISHED` is only recorded with a real post URL.
- **Nothing is fabricated.** Membership counts, activity dates, rules
  and permissions come from recorded evidence or stay `unknown`
  (unknown rules can never qualify a community).
- **The product contract governs messaging** (`docs/product-definition.md`):
  no sawab/reward claims, no testimonials, free always, disclosure line
  always, gentle tone, and every religious reference stays grounded in
  the app's verified content (the linked amal ids are checked against
  the catalog by a test).
- **No two communities get identical text** - drafts carry a fingerprint
  guard and re-roll deterministically on collision.
- **No marketing machinery.** Links are plain deep links (no UTM
  parameters, no analytics beacons); posts are never followed up on,
  A/B tested, or optimized for engagement.
- **Privacy:** community notes must not contain member PII. The store is
  local-only (`outreach/data/` is gitignored - see `.gitignore` for how
  to change that).

## Setup

Nothing is required. Optional environment variables:

| Var | Purpose |
|---|---|
| `BRAVE_SEARCH_API_KEY` | Enables `discover --brave` (free tier: 2,000 queries/month, 1 req/s) |
| `OUTREACH_SITE_URL` | Override the site domain (default `https://amalyn.vercel.app`, kept in sync with `src/lib/site.ts` by a test) |
| `OUTREACH_DATA_DIR` / `--data-dir` | Store location (default `outreach/data`) |
| `OUTREACH_BOARD_PORT` | Review-board port (default 4317) |

## The loop

1. **Discover** - paste search results into a seeds file (see
   `seeds.example.txt`) or run an agent session with `PLAYBOOK.md`,
   then:
   ```sh
   npm run outreach -- discover --input seeds.txt
   ```
2. **Review** - open the board and/or the CLI:
   ```sh
   npm run outreach:board        # localhost, token-gated
   npm run outreach -- list
   ```
3. **Research each candidate** (evidence in, nothing invented):
   ```sh
   npm run outreach -- research <id> --lang bn \
     --evidence "daily after-fajr dhikr threads observed in public posts" \
     --focus "daily after-fajr dhikr threads" \
     --rules permissive --members 8400 --last-post 2026-10-09
   ```
   The transparent score (v2: topic 30 / language 10 / activity 15 /
   welcome 30 / contribution path 10 / reach 5) prints with its reasons
   and gates. The welcome dimension is the heart of the model: explicit
   permission (30) and documented approval processes (24) outrank a mere
   absence of restrictions (12), while unknown rules score zero - silence
   is never treated as permission. Reach is capped at 5 so huge but
   unsuitable groups cannot dominate.
4. **Qualify** (`status <id> research`, then `status <id> qualify`) -
   guarded: total >= 60, topic >= 10, welcome >= 12.
5. **Draft** - `draft <id>` generates the personalized post (and
   `permission <id>` a permission request). Copy it, open the community
   from the board, and post by hand when permitted. `link --dhikr <id>`
   prints the plain challenge deep link if you need it on its own.
6. **Record reality**:
   ```sh
   npm run outreach -- status <id> publish --post-url <the actual post URL>
   npm run outreach -- status <id> complete --note "..."
   ```
   `reject --reason` and `block --reason` keep dead ends out of the way;
   `reopen` revives a REJECTED record when new evidence appears.
   Nothing is scheduled after a publish - the post URL is the record.

## Status model

```
DISCOVERED -> RESEARCHED -> QUALIFIED -> NEEDS_PERMISSION -> APPROVED_FOR_OUTREACH
                                                    \-> APPROVED (rules permissive)
APPROVED_FOR_OUTREACH -> PUBLISHED -> COMPLETED
REJECTED (guarded reopen) and DO_NOT_CONTACT are the off-ramps.
```

Illegal transitions are refused with the legal table printed; every
change appends to `outreach/data/events.jsonl` (the audit trail).

## CLI quick reference

```
add <url> [--name] [--note] [--source]
discover --input <file> | --brave [--query | --queries-file]
research <id> [--lang] [--topic] [--rules] [--rules-url] [--rules-note]
              [--members] [--last-post] [--evidence] [--focus] [--dhikr]
draft <id> [--dhikr] [--lang en|bn|both] [--variant n] [--copy]
permission <id>
status <id> research|qualify|request-permission|approve|publish|complete|reject|block|reopen
list [--status s] | show <id> | stats
link [--dhikr <id>]
merge <source-id> <into-id>
```

## Data files

- `outreach/data/communities.jsonl` - current state, one JSON record per
  line, rewritten atomically on every change
- `outreach/data/events.jsonl` - append-only audit trail
- Corrupt trailing lines are quarantined as
  `communities.jsonl.corrupt-<timestamp>`, never silently dropped
- A lockfile serializes CLI and board writes; a lock older than 30s is
  treated as stale

Do not hand-edit the JSONL files while the board is running.

## Known limitations

- Facebook serves login walls to logged-out fetches, so the tool never
  auto-fetches FB pages; evidence comes from what you or an agent
  session can legitimately observe (public search results, public
  posts) and from visiting the community yourself.
- The same group can appear under both a slug and a numeric id; the
  store cross-checks numeric group ids and `merge` consolidates the rest.
- Draft languages are en/bn only (matching app i18n). Do not post
  machine-translated drafts into other-language communities; run those
  only when a reliable human-quality translation exists.
