# Amalyn

A free, offline-first PWA for Dhikr: choose a quest, count with intention,
and grow a journey of light. Worship stays personal; rewards stay
product-level.

**The product contract** (see `docs/product-definition.md`):

- Never claims to measure sawab, rank believers, or promise religious reward
- No ads, no subscription, no paywalls; Hadiya never gates anything
- Worship history is private by default; sharing is always explicit
- Offline counting is non-negotiable
- Religious content is cited and verified against authentic sources

## Stack

Next.js 16 (App Router) - TypeScript - Tailwind v4 - Dexie (IndexedDB) -
Zustand - Auth.js v5 (optional) - Postgres via Neon (optional)

Progress is event-sourced on-device: every tap appends an immutable event in
IndexedDB; progress is a derived, rebuildable cache. Cloud sync, when
configured, ships the same events to Postgres idempotently.

## Getting started

```sh
npm install
npm run dev
```

The app is fully functional with no configuration. For optional cloud sync:

```sh
cp .env.example .env.local   # fill in what you have
npm run db:push              # apply db/schema.sql to your Postgres
```

Env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` (Google
sign-in), `AUTH_RESEND_KEY`/`EMAIL_FROM` (magic links), `DATABASE_URL`
(Neon Postgres). Missing vars simply disable sync - never the app.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run validate` | Lint + tests + production build (runs after every phase) |
| `npm test` | Vitest (event log, sync merge) |
| `npm run icons` | Regenerate PWA icons from `src/app/icon.svg` |
| `npm run db:push` | Apply `db/schema.sql` to `DATABASE_URL` |

## Religious content

Content lives in `src/lib/content/` as typed data - never fetched or
generated at runtime. Each dhikr carries:

- `source` (collection + reference) and `review.status`:
  - `draft` - initial entry
  - `verified` - references cross-checked against public hadith databases

Production builds show **only** `verified` content (`isQuestPublic()` in
`src/lib/content/index.ts`); references must never be filled from memory.

## Deploying

Any Next.js host (Vercel works as-is). Static assets and the app shell are
served by the built-in service worker (`public/sw.js`) for offline use; API
routes are never cached.

## Docs

- `docs/product-definition.md` - scope, flows, data model, architecture
- `docs/tasks.md` - implementation tracker and progress log
