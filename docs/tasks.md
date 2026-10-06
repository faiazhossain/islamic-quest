# Amalyn — Implementation Tasks

Tracker for v1.0 (scope: `docs/product-definition.md`).
Status values: `todo` / `in_progress` / `done` / `blocked`.
This file is the progress record; update status as work completes.

Dependencies are noted per task. Phases are ordered; within a phase, tasks
can interleave unless a dependency says otherwise.

---

## Phase A — Foundation

| ID | Task | Depends on | Status |
|---|---|---|---|
| A1 | Scaffold Next.js (App Router, TS, Tailwind), git init | — | done |
| A2 | Design tokens + base styles (color, type, spacing, radius, motion, themes) | A1 | done |
| A3 | App shell: layout, bottom nav, safe-area, theme handling | A2 | done |
| A4 | PWA: manifest, icons, service worker, offline shell | A3 | done |
| A5 | Typed content model + quest data file structure (content fill gated on scholar review) | A1 | done |

## Phase B — Core loop

| ID | Task | Depends on | Status |
|---|---|---|---|
| B1 | Dexie schema, event log, progress repositories + unit tests | A1 | done |
| B2 | Explore screen (categories, quest list) | A3, A5 | done |
| B3 | Quest detail screen (content, citation, start) | B2 | done |
| B4 | Counter: tap, undo, haptics, wake lock, derived milestones, persistence | B1, B2 | done |
| B5 | Completion celebration screen | B4 | done |
| B6 | Journey screen (winding path of light from event history) | B5 | done |
| B7 | Share card composer (9:16, theme, hide count, Web Share) | B5 | done |

## Phase C — Settings and support

| ID | Task | Depends on | Status |
|---|---|---|---|
| C1 | Settings screen (haptics, sound, wake, theme) wired to real behavior | A3, B4 | done |
| C2 | Data export/import + local reset | B1 | done |
| C3 | Support (Hadiya) page + About/Privacy page | A3 | done |

## Phase D — Account and sync

| ID | Task | Depends on | Status |
|---|---|---|---|
| D1 | Auth.js: magic link (Resend) + Google OAuth | A1 | done |
| D2 | Sync API: idempotent event merge, server validation, rate limiting | B1, D1 | done |
| D3 | Account UI: sign in, sync status, delete my data | D1, D2, C1 | done |

## Phase E — Launch readiness

| ID | Task | Depends on | Status |
|---|---|---|---|
| E1 | Launch quest catalog drafted with citations (gate: scholar review) | A5 | done |
| E2 | Accessibility + mobile audit (320–430px, reduced motion, touch targets) | B7, C1 | done |
| E3 | Performance pass (bundle size, LCP, offline behavior) | A4, B7 | in_progress |
| E4 | Self-review sweep + tests for critical logic (events, counter, sync merge) | B1, D2 | done |
| E5 | Polish: loading/empty/error states, copy review against product contract | all | done |

---

## Progress log

- 2026-10-05 — Product definition approved. A1 started.
- 2026-10-05 — Phases A + B1 complete: design system tokens ("night before
  dawn" identity, Fraunces / Hanken Grotesk / Amiri), app shell with bottom
  nav + safe areas, PWA (manifest, generated icons, hand-rolled SW), typed
  content model with a production review gate, Dexie event log with derived
  progress + 7 passing tests. Build, lint, tests, and a prod-server smoke
  test all green.
- 2026-10-05 — Phase B complete (B2-B7): Explore with category filters and
  live progress, quest detail with Arabic/transliteration/meaning/citation,
  fullscreen counter (tap, undo, haptics, wake lock, optional sound,
  derived milestone moments, completion redirect), completion celebration,
  Journey path-of-light with stats, 9:16 canvas share card (night/dawn
  themes, show/hide count, Web Share with download fallback).
  Religious-content validation pass: no sawab/virtue claims in any UI copy;
  Arabic renders with dir=rtl and Amiri; citations display wired; review
  status shown honestly per item. validate.sh green after each screen.
- Citation verification started: three research agents independently
  verifying all hadith references against public hadith databases.
- 2026-10-05 — Phase C complete: Settings (theme choices, haptics/sound/
  wake toggles), data export/import with validation, double-confirm erase,
  Support (Hadiya) page with founder-link placeholder, About/Privacy page
  carrying the four public promises.
- 2026-10-05 — Phase D complete: Auth.js v5 (Google + Resend magic link),
  idempotent sync API (event-uuid upsert, catalog/time/shape validation,
  fixed-window rate limit), Postgres schema + db:push script, client sync
  manager (mount/online/visible/interval, disabled-state caching), account
  section with sign-in, sync-now, sign-out, delete-server-copy. Everything
  degrades gracefully without env vars (verified: /api/sync returns
  enabled:false, app fully functional).
- 2026-10-05 — Phase E partial: dynamic Home screen (current quest card,
  today total, journey teaser), unused `motion` dependency removed, copy
  audit clean (no sawab/leaderboard/ranking language anywhere), contrast
  checked on accent/tertiary tokens (4.5:1+), first research agent returned:
  3 of 9 dhikr now citation-verified at high confidence (one narrator
  correction caught: Muslim 2702 is al-Agharr al-Muzani). 11 tests passing.
- Route smoke test (prod server): all 11 routes return 200.
- E3 note: hygiene done (unused dep removed, fonts self-hosted via
  next/font, no analytics); real bundle/LCP measurement on a device still
  pending before launch.
- 2026-10-05 — E1 COMPLETE: all 9 dhikr citation-verified by three
  independent research passes (archived sunnah.com reference lines
  cross-checked against dorar.net, hadithanswers.com, and two public
  hadith datasets). Numbering errors caught and corrected vs common
  citations: tasbih triplet is Bukhari 843 + Muslim 596a (+ Bukhari 5362),
  NOT Muslim 594; "best dhikr" is Tirmidhi 3383 alone (Hasan, Darussalam);
  Muslim 2702 narrator is al-Agharr al-Muzani. All items carry notes that
  are bibliographic only - no virtue quotes displayed in the app. Final
  state: 9/9 status "verified"; human scholar sign-off (status "reviewed")
  remains the launch gate per the product contract. Final validate.sh:
  lint clean, 11/11 tests, production build green.
- 2026-10-05 — QA review round (senior-SQA + content authenticity pass).
  Content: all 9 primary citations re-checked and confirmed authentic;
  transliteration corrected ("wa bihamdihi"); residual scholar-pass items
  noted: Muslim 406 vs 408 numbering, secondary parallel numbers (Bukhari
  6610/7386, Tirmidhi 483, Bukhari 4797/6357), sunnah timing note for
  Sayyid al-Istighfar. Fixes shipped: launch tripwire (assertLaunchReady -
  production build now FAILS while the catalog has no "reviewed" entries;
  deliberate staging builds use ALLOW_UNREVIEWED_BUILD=1; verified the
  failure and the override), deep links now respect the review gate
  (getPublicQuest across quest detail/count/complete/share + public-only
  generateStaticParams - verified: prod deep link renders "quest doesn't
  exist", previously served unreviewed content), shared sync-event
  validator (src/lib/event-validation.ts) used by both the API route and
  settings import so an accepted import can never wedge sync with a
  permanent 400; import now forces synced:0 so restored backups re-push
  (server dedupes by uuid) and MAX_AGE widened to 10y so year-old backups
  restore cleanly; today total clamped at zero (undo of a pre-today count
  could show "Today: -1"); share card uses completion-date state (no more
  race printing today's date) and refuses to render a milestone card for
  an uncompleted deep-linked quest; counter rejects non-primary pointers
  (palm/second finger) and sets touch-manipulation; ConfirmDialog restores
  focus to its trigger on close; sync user_key is now an HMAC of the email
  (pseudonymous - a DB leak can no longer pair identity with worship
  history) with matching copy in the account section. Tests: 23 passing
  (new: event-validation suite, content gate suite, negative-today
  regression). Note: `npm run build`/validate.sh is intentionally red
  until scholar review flips the 9 statuses or a staging build sets
  ALLOW_UNREVIEWED_BUILD=1.
