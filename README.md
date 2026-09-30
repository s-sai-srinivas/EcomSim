# EcomSim

An Amazon-style e-commerce **simulator** (amazon.in skin) built for education and demos:
real product catalog, full browse → PDP → cart → checkout → payment → order-tracking loop.
No real money moves anywhere.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 + SQLite (dev) ·
Zustand · TanStack Query · Zod · Vitest · Playwright

## Getting started

```bash
npm install                # also runs prisma generate
cp .env.example .env       # defaults work for local SQLite
npm run db:push            # create/sync dev.db from prisma/schema.prisma
npm run dev                # http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (runs prisma generate first) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | Browser E2E (Playwright, auto-starts dev server) |
| `npm run format` | Prettier write |
| `npm run db:push` | Sync Prisma schema → database |

## Project docs

All product/planning documentation lives in [`plans/`](./plans/README.md):

- Product data research & pipeline (real amazon.in catalog)
- Feature inventory & design-system specs
- Architecture guide (`plans/04-architecture.md`)
- Phase-wise development plans (`plans/phases/`)

## Compliance

This is a private educational simulator. It intentionally does **not** use Amazon's name,
logos, or proprietary fonts. Layout/UX patterns are mimicked; brand identity is our own.
