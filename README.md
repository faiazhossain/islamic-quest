# islamic-quest

**Amal Quest** is a free, offline-first PWA that helps Muslims build a
consistent personal dhikr practice through quests, milestones, and a visual
journey. Choose a quest, count with a calm counter, and watch your journey of
light grow.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |
| `npm run icons` | Regenerate PWA icons from `scripts/icon-maskable.svg` |

## Tech stack

- Next.js (App Router) and React
- Tailwind CSS with design tokens defined in `src/app/globals.css`
- Dexie (IndexedDB) for offline-first storage
- Zustand for state management
- Motion for animation
- Vitest for unit tests

## Documentation

- `docs/product-definition.md` — product summary, scope, and guardrails
- `docs/tasks.md` — task breakdown and progress log
