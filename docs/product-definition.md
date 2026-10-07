# Amalyn — Product Definition (v1.0)

Status: Draft for approval
Date: 2026-10-05
Phase: 2 of the product workflow (Product Definition)

---

## 1. Product summary

Amalyn is a free, offline-first PWA that helps Muslims build a consistent
personal Dhikr practice through quests, milestones, and a visual journey.

One sentence: **Choose a quest, count with a calm and satisfying counter, and
watch your journey of light grow — worship stays personal, rewards stay
product-level.**

### Unchangeable product contract

1. The app never claims to measure sawab, rank believers, or promise religious
   reward. All rewards are product-level (quests completed, journey progress,
   cards shared). The app may, however, quote — with full citation — what the
   Prophet ﷺ said about an amal's practice and virtue (guidance hadith,
   added 2026-10-06); quoted Prophetic statements are content, never a
   computed claim about the user.
2. No ads, no subscription, no paywall. Hadiya is voluntary, never gates
   anything, and never interrupts the worship flow.
3. Worship history is private by default. Sharing is always an explicit act.
4. Offline counting is non-negotiable. Network is never required for a tap.
5. Religious content is never invented. Every item is cited and
   verified against authentic sources.
6. Gentle tone. No guilt, no streak-shaming, no retention pressure.
7. Reduced-motion, large text, and touch-target accessibility are first-class.

---

## 2. v1.0 scope

### In

| Area | Scope |
|---|---|
| Quest catalog | ~12–15 quests across 4–5 categories, tiered targets (33 / 100 / 500 / 1000) |
| Counter | Fullscreen tap counter: +1 per tap, undo, pause, haptics, screen wake, progress bar, milestone moments |
| Completion | Reverent celebration screen + quest marked complete |
| Share card | One 9:16 card: dhikr name, completion, date, Amalyn mark; theme choice; show/hide count |
| Journey | Winding path of light — glowing milestone waypoints, simple personal record ("N days with Amalyn") |
| Account | Optional. Magic link + Google. Cloud sync of progress. App fully functional signed out. |
| Settings | Haptics, sound, screen wake, theme, data export/import, account, delete data, Support (Hadiya), About/Privacy |
| PWA | Installable, offline shell, offline counting, safe-area support |
| i18n | English UI, Bangla shipped in v1.1 (2026-10-07): settings-driven language (en/bn) with a first-visit chooser - not next-intl, which is built around a request locale and was never installed |

### Out (deliberately)

| Feature | When | Why |
|---|---|---|
| Passport | v1.1 | Signature feature, deserves its own polish cycle |
| Achievements | v1.1 | Depends on a meaningful definition pass, not filler badges |
| Knowledge cards | v1.1 | Content verification pipeline must exist first |
| Bangla localization | v1.1 | Content + QA double when it ships |
| Community goals | v2 | Cold-start problem; aggregate numbers look dead at launch |
| Streaks as a system | v1.1 | v1 carries only a quiet personal record; full gentle-streak layer later |
| Analytics | Plausible (added 2026-10-06, user-directed) | Cookieless, aggregate page-view counting via plausible.nsuone.com; disclosed on About & Privacy; never connected to worship data. The original "none in v1" scope tightened to this single privacy-friendly counter |

---

## 3. User flows

### F1 — First open (no account)
Onboarding (3 skippable steps: what Amalyn is, privacy promise, pick your
first quest) → Home. No signup anywhere in this flow.

### F2 — Start a quest
Home or Explore → Quest detail (Arabic, transliteration, meaning, practice
guidance, citation) → "Start Quest" → Counter.

### F3 — Counting (the core loop)
Tap anywhere → +1, soft haptic tick → progress bar advances → milestone
moments at 25% / 50% / 75% / "almost there" show quiet encouragement → target
reached → Completion. Undo and pause always available. Leaving mid-quest
preserves progress.

### F4 — Completion
Reverent celebration (no confetti-arcade) → offer share card (skippable) →
Journey path extends → return Home.

### F5 — Return visit
Home shows active quest, today's status, journey teaser → Continue.

### F6 — Account + sync (optional)
Entry points: Settings, or a one-time gentle prompt after a first completion
(never during counting). Sign in → queued local events sync → subsequent
sessions sync in background when online. Signed-out use is never degraded.

---

## 4. Screen list (mobile-first)

| # | Screen | Notes |
|---|---|---|
| 1 | Onboarding | 3 steps, skippable, sets tone |
| 2 | Home | Current quest, today, journey teaser, explore. Not overcrowded. |
| 3 | Explore | Categories → quest list |
| 4 | Quest detail | Content + citation + Start |
| 5 | Counter | Fullscreen, distraction-free, wake lock active |
| 6 | Completion | Celebration + share entry |
| 7 | Share composer | Card preview, theme, show/hide count, native share |
| 8 | Journey | Winding path of light |
| 9 | Settings | Preferences, data, account |
| 10 | Support (Hadiya) | Explainer + external link |
| 11 | About / Privacy | Plain-language promises |

Bottom navigation: Home / Explore / Journey / Settings. Thumb-reach zone.
Every screen verified at 320 / 360 / 390 / 430 px.

---

## 5. Design principles

1. **Peaceful core, adventurous meta.** The counter feels sacred and calm; the
   quest/journey layer carries gentle exploration.
2. **Never guilt.** Copy never shames a missed day. "Your Journey is waiting,"
   never "You broke your streak!"
3. **Distinct identity.** Not the generic green Islamic app. Atmospheric,
   modern-spiritual; recognizable without the logo. (Full design system in
   Phase 4.)
4. **Rewards are product-level only.** Quest complete, journey grows, card
   shared — never religious status.
5. **Offline-first.** Every core action works with zero network.
6. **Respectful motion.** Subtle, reverent animation; `prefers-reduced-motion`
   honored everywhere; haptics and sound are opt-out.
7. **One-handed mobile.** Large targets, bottom nav, minimal depth.

---

## 6. Content model

Religious content lives in typed TypeScript data files in the repo, cited
and verified before launch. It is never fetched from a third-party API or
generated at runtime. Bangla fields are optional until v1.1 (i18n-ready
shape).

```ts
interface Dhikr {
  id: string;
  names: { en: string; bn?: string };
  arabic: string;
  transliteration: string;
  meaning: { en: string; bn?: string };
  category: CategoryId;        // istighfar | tasbih | salawat | dua | ...
  practiceGuidance: string;    // e.g. "any time", "after salah"
  source: {
    collection: string;        // e.g. "Sahih al-Bukhari"
    reference: string;         // hadith/verse number
    note?: string;             // grading/ATTRIBUTION context, verification-supplied
  };
  review: {
    status: "draft" | "verified";
    verifiedSources?: string[]; // where the citation was cross-checked
    verifiedAt?: string;        // ISO date
  };
}

interface Quest {
  id: string;
  dhikrId: string;
  target: number;              // 33 | 100 | 500 | 1000
  title: { en: string; bn?: string };
  description: { en: string; bn?: string };
}
```

Milestones are **derived from the target** (25% / 50% / 75% / near-end /
complete), not fixed absolute numbers — a 33x quest and a 1000x quest both get
proportionate moments.

Content rule: no hadith citations appear anywhere in this document. The
launch catalog is produced by the verification process (Section 9) and each
item ships with its citation and review status.

---

## 7. Data model

### Local (IndexedDB via Dexie) — source of truth while signed out

```
events        { id(uuid), type: increment|undo|quest_started|quest_completed,
                questId, delta?, at, synced: boolean }        -- append-only
questProgress { questId, count, completedAt? }   -- derived cache, rebuildable
settings      { language, haptics, sound, wakeLock, theme }
profile       { displayName?, createdAt }
```

The event log is appendable by design: XP/levels (if ever) and cloud sync both
derive from it without a data migration.

### Server (Postgres via Neon)

```
users           (id, email, createdAt)
progress_events (id, user_id, client_event_id, type, quest_id, delta, at)
```

- Auth via Auth.js: Google OAuth + email magic link (Resend SMTP).
- `client_event_id` makes sync idempotent — retries never double-count.
- Events are append-only server-side; the server validates shape, ownership,
  and rate limits. Raw client totals are never trusted.
- Reconciliation: client pushes unsynced events → server returns an
  authoritative snapshot → client merges. Because counts only change through
  events, merges are order-independent.
- "Delete my data" wipes server rows; local reset lives in Settings.

---

## 8. Architecture summary

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | One codebase; API routes for auth + sync; natural path to v2 community features |
| Styling | Tailwind + design tokens | Tokens defined Phase 4; no hardcoded palette values in components |
| Motion | Motion (framer-motion) | Reverent, subtle; reduced-motion respected |
| State | Zustand (minimal) + Dexie | Counter state separate from persistence |
| Local DB | Dexie (IndexedDB) | Event log + derived caches |
| Auth | Auth.js v5 | Google OAuth + magic link |
| DB host | Neon (serverless Postgres) | Free tier to start |
| PWA | Hand-rolled manifest + service worker | App Router makes next-pwa awkward; a small custom SW is more predictable (decision confirmed at implementation) |
| i18n | typed copy table + LocalizedText fields (`src/lib/i18n/`) | `en` + `bn`; first-visit chooser, Settings toggle |
| Hosting | Vercel | Free tier |
| Security | Server-side validation, RLS-equivalent ownership checks, rate limiting on sync/auth | Section 31 of the brief honored |

---

## 9. Content verification process

1. Draft the launch catalog from an established, widely used compilation
   (e.g., Hisnul Muslim) — every item with collection + reference.
2. Founder self-check against sources.
3. **Verification gate before public launch.** Every citation is
   cross-checked against authentic collections; no quest ships with
   `review.status !== "verified"`.
4. Citations are visible on every quest detail screen.

This is the launch-critical path; sourcing starts in parallel with
implementation, not after it.

---

## 10. Roadmap

- **v1.0** — Loop-first MVP as scoped above.
- **v1.1** — Bangla, Passport, achievements, knowledge cards, gentle streak
  layer.
- **v2** — Anonymous aggregate community goals (small backend already exists),
  reconsider friends/shared goals.

---

## 11. Risks and open items

| Risk | Mitigation |
|---|---|
| Content verification is the long pole | Start sourcing in parallel with implementation; gate launch on review |
| Sync is the biggest v1 engineering risk | App never depends on it; if needed, sync can ship weeks after launch without product changes |
| PWA + App Router service-worker quirks | Custom SW kept small; offline shell tested early, not at the end |
| Tone drift toward "game" | Design principles + copy review against the unchangeable contract on every feature |
| Solo-founder maintenance load (Next.js full-stack) | Thin data layer, small dependency list, no premature abstraction |

---

## 12. As-built notes (v1.0, 2026-10-05)

Deviations from the spec above, made during implementation and documented
for future maintainers:

1. **Settings storage**: settings live in `localStorage` via Zustand, not a
   Dexie table. Theme must resolve synchronously before first paint; the
   Dexie store holds events and progress only.
2. **Quest titles/descriptions are derived** (dhikr name + target) rather
   than stored per tier - 20 quests across 9 dhikr, zero duplicated copy.
3. **Review states**: `draft` -> `verified` (references cross-checked by
   an automated research pass against archived sunnah.com pages and
   independent databases; the production gate). Only `verified` content
   ships in production builds.
4. **Focus mode**: counter/completion/share hide the bottom nav via the
   shell (`/quest/*/{count,complete,share}`), not route groups.
5. **Lifelong practice layer (2026-10-06)**: completing a Quest is a one-time
   milestone; the Amal itself continues. No new event types, schema, or sync
   surface - the all-quests-complete state, the daily "Today's Amal"
   suggestion (smallest completed tier of the picked dhikr, rotated by local
   day), personal stats (days practiced, days in a row, personal best, month
   totals), and the counter's daily practice frame all derive from the
   append-only event log in pure functions (`src/lib/practice.ts`,
   `src/lib/home.ts`). A completed quest's milestone date is immutable and
   its counter never re-fires the milestone; consistency language is
   deliberately streak-free ("days in a row", personal best) with no loss
   state.
6. **Hadith guidance layer (2026-10-06)**: each dhikr carries cited
   guidance hadith (`src/lib/content/hadith.ts`, accessed only through
   `hadithForDhikr()`) shown in a quest-detail modal - bottom sheet on
   phones, centered dialog on desktop. Narrations are entered once and may
   guide several dhikr through `dhikrIds`. Each entry carries its own
   review status, deliberately never inherited from the parent dhikr;
   `draft` entries never ship to production (same environment gate as
   quests). English renderings are composed for Amalyn, never copied from
   published translations. Bangla renderings ship only as verbatim iHadis
   text; entries not yet located there ship English-only.
