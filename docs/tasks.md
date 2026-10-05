# Amal Quest — Implementation Tasks

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
| B2 | Explore screen (categories, quest list) | A3, A5 | todo |
| B3 | Quest detail screen (content, citation, start) | B2 | todo |
| B4 | Counter: tap, undo, haptics, wake lock, derived milestones, persistence | B1, B2 | todo |
| B5 | Completion celebration screen | B4 | todo |
| B6 | Journey screen (winding path of light from event history) | B5 | todo |
| B7 | Share card composer (9:16, theme, hide count, Web Share) | B5 | todo |

## Phase C — Settings and support

| ID | Task | Depends on | Status |
|---|---|---|---|
| C1 | Settings screen (haptics, sound, wake, theme) wired to real behavior | A3, B4 | todo |
| C2 | Data export/import + local reset | B1 | todo |
| C3 | Support (Hadiya) page + About/Privacy page | A3 | todo |

## Phase D — Account and sync

| ID | Task | Depends on | Status |
|---|---|---|---|
| D1 | Auth.js: magic link (Resend) + Google OAuth | A1 | todo |
| D2 | Sync API: idempotent event merge, server validation, rate limiting | B1, D1 | todo |
| D3 | Account UI: sign in, sync status, delete my data | D1, D2, C1 | todo |

## Phase E — Launch readiness

| ID | Task | Depends on | Status |
|---|---|---|---|
| E1 | Launch quest catalog drafted with citations (gate: scholar review) | A5 | blocked |
| E2 | Accessibility + mobile audit (320–430px, reduced motion, touch targets) | B7, C1 | todo |
| E3 | Performance pass (bundle size, LCP, offline behavior) | A4, B7 | todo |
| E4 | Self-review sweep + tests for critical logic (events, counter, sync merge) | B1, D2 | todo |
| E5 | Polish: loading/empty/error states, copy review against product contract | all | todo |

---

## Progress log

- 2026-10-05 — Product definition approved. A1 started.
- 2026-10-05 — Phases A + B1 complete: design system tokens ("night before
  dawn" identity, Fraunces / Hanken Grotesk / Amiri), app shell with bottom
  nav + safe areas, PWA (manifest, generated icons, hand-rolled SW), typed
  content model with a production review gate, Dexie event log with derived
  progress + 7 passing tests. Build, lint, tests, and a prod-server smoke
  test all green.
