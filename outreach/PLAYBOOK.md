# Outreach research playbook (agent runs)

How an agent session executes one discovery-to-qualification cycle. The
goal of each run: a handful of genuinely qualified, evidence-backed
candidates in the store - not a long list of raw links.

## Ground rules for every run

- **Public information only.** No login walls bypassed, no CAPTCHAs, no
  private group content, no member lists, no fake accounts, no bulk
  messaging, no automated commenting, no browser automation to evade
  platform restrictions.
- **Facebook facts come from legitimate observation:** search-engine
  results, public group/page previews, the community's public "about"
  text, or the operator's own visit. If a fact cannot be verified, record
  it as unknown - never guess.
- **Dates and counts are observed, not inferred.** `--last-post` only
  when a post date is actually visible; `--members` only when the count
  is publicly displayed.
- **Every candidate must carry an evidence sentence** - what was seen,
  where, and why it suggests the regular-amal feature fits. No evidence,
  no qualification.
- Disclose agent assistance in the store note when a run is automated
  (e.g. note: "found via agent search run 2026-10-12").

## Run procedure

1. **Prepare queries.** Use the query sets below plus anything topical.
   Prefer `site:facebook.com/groups <topic>` patterns; add Pages queries
   sparingly (`site:facebook.com <topic> page`). Vary regions/cities for
   global coverage.
2. **Collect results into a seeds file** (`outreach/seeds-<date>.txt`,
   gitignored area): one candidate per line, ideally
   `name<TAB>url<TAB>what-was-observed`. Skip anything clearly off-topic
   before it touches the store.
3. **Ingest:**
   ```sh
   npm run outreach -- discover --input outreach/seeds-<date>.txt
   ```
   In-file and store duplicates collapse automatically (dedup keys are
   canonical: hosts, suffix paths, tracking params and casing all
   normalize).
4. **Research each new candidate** (the store lists new ids):
   ```sh
   npm run outreach -- research <id> \
     --lang bn --rules permission_required \
     --evidence "<what you observed, where>" \
     --focus "<short focus phrase for drafts>" \
     [--members n] [--last-post YYYY-MM-DD]
   ```
   Field guidance:
   - `lang`: `bn`, `en`, `mixed` only when the community's posting
     language is actually observable; otherwise leave unknown.
   - `rules`: set `permissive` / `permission_required` / `anti_promo`
     only from visible rules (pinned posts, about text) or an admin's
     statement; unknown stays unknown and blocks qualification.
   - `topic`: infer (adhkar > daily_practice > general > quotes) or set
     explicitly; off-topic candidates get `status <id> reject --reason`.
   - `focus`: <= 80 chars, a noun phrase describing what the community
     does, e.g. "daily morning and evening adhkar check-ins". Drafts
     interpolate this - keep it accurate.
5. **Qualify or park:** `status <id> research` then, when gates pass,
   `status <id> qualify`. Communities needing admin approval move to
   `request-permission`. Ambiguous cases stay RESEARCHED with a note for
   the operator - do not force them through.
6. **Close the run:** `stats`, then report counts and anything waiting
   on the operator (unknown rules, ambiguous cases).
   The audit log records everything.

## Query sets

Discovery intent families (rotate through them; each targets a different
kind of fit for the regular-amal feature):

1. Daily dhikr challenges and accountability
2. Muslim habit-building and worship consistency
3. Islamic productivity and personal development
4. Regular amal tracking and Quran-reading habits
5. Muslim student communities and Islamic campus societies
6. Communities sharing useful Islamic tools and resources
7. Bangla and English first; other languages only when a reliable
   human-quality translation exists

English (global) - note the search backend ignores `site:` operators;
quote `"facebook.com/groups"` instead:

```
"facebook.com/groups" dhikr challenge accountability
"facebook.com/groups" muslim habit accountability
"facebook.com/groups" worship consistency challenge
"facebook.com/groups" quran journaling challenge
"facebook.com/groups" muslim students association
"facebook.com/groups" MSA university islamic society
"facebook.com/groups" islamic productivity personal development
muslim productivity blog guest post guidelines
islamic apps submit your app directory
islamic forum daily dhikr section
reddit muslim self improvement community
```

Bangla (Bangladesh + diaspora):

```
"facebook.com/groups" জিকির চ্যালেঞ্জ
"facebook.com/groups" আমল চ্যালেঞ্জ
"facebook.com/groups" কুরআন শিক্ষা চ্যালেঞ্জ
"facebook.com/groups" মুসলিম প্রোডাক্টিভিটি
```

Brave API path (1 req/s, free tier):

```sh
export BRAVE_SEARCH_API_KEY=...
npm run outreach -- discover --brave                # built-in default queries
npm run outreach -- discover --brave --queries-file outreach/queries-bn.txt
```

## Non-Facebook sources

Forums, blogs, newsletters, directories and organizations each carry
their own submission culture - never reuse Facebook assumptions:

- **Forums:** read the forum rules page and the relevant sub-board's
  pinned guidance. Classify by their actual policy; many ban app
  promotion in general boards while running dedicated "Islamic apps and
  software" threads where sharing is the norm.
- **Reddit:** read subreddit rules and wiki; some ban app spam outright,
  others allow it with disclosure. Modmail-first is the documented
  approval process where rules say "contact the mods".
- **Blogs/newsletters:** look for guest-post guidelines, resource pages,
  or "submit a tool" links. A contact form alone is NOT an invitation.
- **Directories:** an explicit "submit your app" link is the strongest
  welcome evidence a directory can show - record the submission URL.
- **Organizations/campus societies:** resource pages or newsletter
  editors; permission-required by default.

Record the exact policy quote and its URL in `--rules-note`; set
`--contribution` to the observed channel (`submission_form`,
`admin_approval`, `direct_contact`) only when the page documents one.

## Escalate to the operator

- Rules text is ambiguous or contradicts observed behavior
- A community is politically charged or split by controversy
- An admin invites a collaboration beyond a single post
- Anything that would require creating accounts, joining groups under a
  persona, or messaging members directly

## Never

- Never claim a publication that the platform does not show.
- Never post identical text to two communities (the fingerprint guard
  enforces this at generation time; keep it that way).
- Never store member names, emails, or handles in notes.
- Never promise religious rewards, quote the app as an authority, or
  imply endorsement by any scholar or organization.
- Never follow up on a post to chase engagement, poll for responses, or
  collect community feedback - Amalyn has an in-app feedback section,
  and this workflow only records that a post was shared.
