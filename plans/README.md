# EcomSim — Amazon-Style E-commerce Simulator

> A production-grade, pixel-faithful Amazon shopping experience simulator: real product catalog,
> full browse → PDP → cart → checkout → payment → order-tracking loop. For education/demo use.

## Goal

Users must feel like they are shopping on the real Amazon site — same layout, same interaction
patterns, same ordering flow — backed by **real Amazon product data** (real names, images, prices,
ratings). The real catalog is the selling point; no lorem-ipsum / dummy data anywhere.

## Document map

| File | What it covers |
| --- | --- |
| `01-research-product-data.md` | **How to get the real product database** — datasets, APIs, scraping services, image strategy, recommended pipeline |
| `02-feature-inventory.md` | Every Amazon feature required for a complete ordering experience (MVP → v2) |
| `03-design-system-specs.md` | Pixel-level Amazon design tokens: colors, typography, components, page anatomy |
| `04-architecture.md` | Tech stack, project structure, data model, state management, API design |
| `phases/` | Phase-wise development plans (below) |

## Phase plan & rough timeline (~5–7 weeks solo, parallelizable)

| Phase | Focus | Output | Effort |
| --- | --- | --- | --- |
| 00 | Foundations: repo, stack scaffold, tooling | Runnable skeleton + CI scripts | 0.5–1d |
| 01 | Design system & app shell (pixel-fidelity) | All shared components + header/footer | 3–4d |
| 02 | **Product data pipeline (REAL catalog)** | ≥30K real products + bestseller ranks + images + API | 3–5d |
| 03 | Catalog: home / search / category pages | Full browsing experience | 4–6d |
| 04 | Product detail page | Complete PDP w/ buy box & carousels | 4–6d |
| 05 | Cart, wishlist, sign-in sim | Persistent cart/auth flows | 4–5d |
| 06 | Checkout pipeline (address/delivery/review) | Orders created pending payment | 4–6d |
| 07 | Payment simulation page (Razorpay-style) | Success/fail payment paths | 3–5d |
| 08 | Orders, tracking, cancel/returns | Full post-purchase lifecycle | 4–5d |
| 09 | Polish, hardening, deployment | Deployed, tested, documented | 4–6d |

Critical path note: Phases 01+02 are independent — run in parallel; **products become visible
after Phase 02**, storefront after Phase 03.

Read order for a new contributor: this README → `01` → `04` → phases.

## Key decisions (CONFIRMED)

1. **Marketplace skin:** `amazon.in` ✅ (INR ₹, UPI/COD payments, Razorpay-style checkout)
2. **Product data — REAL products only, hybrid acquisition:**
   - Day 1: bulk-import real amazon.in Kaggle CSVs (~310K products) into our own DB.
   - Week 1–2: scrape **Best-Sellers per category by URL** (managed scraper API free tier, with a
     Playwright-stealth fallback) to get top-selling items per category.
   - Never call third parties during page render ("realtime embedding" is impossible/broken —
     iframes are blocked by Amazon, live API calls are slow/expensive/rate-limited). Refresh jobs
     keep our DB fresh instead. Full analysis: `01-research-product-data.md`.
3. **Payments:** simulated gateway UI pixel-matched to Razorpay Checkout first; Razorpay/Stripe
   **test-mode keys** can be swapped in behind an interface later. No real money ever moves.
4. **Stack:** Next.js 15 + TypeScript + Tailwind CSS + Prisma + SQLite(dev)/Postgres(prod).
   See `04`.

## Compliance guardrails

- Layout/design mimicry for a private simulator is fine; do **not** ship publicly with Amazon
  trademarks/logos ("Amazon", smile logo, Ember font). Public demos should rebrand the logo text
  while keeping the layout. Keep all brand assets behind one `<Logo />` component to make swap easy.
- Dataset licenses vary (some Kaggle sets are non-commercial). Verify before any commercial use;
  education/internal demo use is generally acceptable per each license — check `01`.
- Never republish the imported database itself.
