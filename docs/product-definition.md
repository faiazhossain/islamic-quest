# Amal Quest — Product Definition (v1.0)

Status: Draft for approval
Date: 2026-10-05
Phase: 2 of the product workflow (Product Definition)

---

## 1. Product summary

Amal Quest is a free, offline-first PWA that helps Muslims build a consistent
personal Dhikr practice through quests, milestones, and a visual journey.

One sentence: **Choose a quest, count with a calm and satisfying counter, and
watch your journey of light grow — worship stays personal, rewards stay
product-level.**

### Unchangeable product contract

1. The app never claims to measure sawab, rank believers, or promise religious
   reward. All rewards are product-level (quests completed, journey progress,
   cards shared).
2. No ads, no subscription, no paywall. Hadiya is voluntary, never gates
   anything, and never interrupts the worship flow.
3. Worship history is private by default. Sharing is always an explicit act.
4. Offline counting is non-negotiable. Network is never required for a tap.
5. Religious content is never invented. Every item is cited and
   scholar-reviewed before public launch.
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
| Share card | One 9:16 card: dhikr name, completion, date, Amal Quest mark; theme choice; show/hide count |
| Journey | Winding path of light — glowing milestone waypoints, simple personal record ("N days with Amal Quest") |
| Account | Optional. Magic link + Google. Cloud sync of progress. App fully functional signed out. |
| Settings | Haptics, sound, screen wake, theme, data export/import, account, delete data, Support (Hadiya), About/Privacy |
| PWA | Installable, offline shell, offline counting, safe-area support |
| i18n | English UI, architected with next-intl so Bangla ships in v1.1 without rework |

### Out (deliberately)

| Feature | When | Why |
|---|---|---|
| Passport | v1.1 | Signature feature, deserves its own polish cycle |
| Achievements | v1.1 | Depends on a meaningful definition pass, not filler badges |
| Knowledge cards | v1.1 | Content verification pipeline must exist first |
| Bangla localization | v1.1 | Content + QA double when it ships |
| Community goals | v2 | Cold-start problem; aggregate numbers look dead at launch |
| Streaks as a system | v1.1 | v1 carries only a quiet personal record; full gentle-streak layer later |
| Analytics | none in v1 | Nothing to measure without a data pipeline; privacy-friendly counters can come later |

---

## 3. User flows

### F1 — First open (no account)
Onboarding (3 skippable steps: what Amal Quest is, privacy promise, pick your
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

Religious content lives in typed TypeScript data files in the repo, reviewed
before launch. It is never fetched from a third-party API or generated at
runtime. Bangla fields are optional until v1.1 (i18n-ready shape).

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
    note?: string;             // grading/ATTRIBUTION context, scholar-supplied
  };
  review: {
    status: "draft" | "reviewed";
    reviewer?: string;
    reviewedAt?: string;       // ISO date
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
| i18n | next-intl | `en` now, `bn` in v1.1 |
| Hosting | Vercel | Free tier |
| Security | Server-side validation, RLS-equivalent ownership checks, rate limiting on sync/auth | Section 31 of the brief honored |

---

## 9. Content verification process

1. Draft the launch catalog from an established, widely used compilation
   (e.g., Hisnul Muslim) — every item with collection + reference.
2. Founder self-check against sources.
3. **Scholar or student-of-knowledge review gate before public launch.**
   No quest ships with `review.status !== "reviewed"`.
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
