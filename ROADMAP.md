# MilesOS — Development Roadmap

Build order for the MVP defined in [PRODUCT.md](./PRODUCT.md) §8, using the architecture in [ARCHITECTURE.md](./ARCHITECTURE.md). Each milestone ends with something real to open in a browser and test — no milestone is "just plumbing" with nothing to look at.

## M0 — Project Scaffolding
Next.js + TypeScript app, Tailwind + shadcn/ui installed, Prisma connected to a Neon Postgres instance, deployed to Vercel. A single health-check page confirming the full chain (browser → app → database → deploy) works.
**Working app:** a deployed, blank MilesOS reachable over the internet, proving the whole pipeline before any feature is built.

## M1 — Institutions & Accounts Onboarding
Google OAuth login restricted to the one allow-listed account. Onboarding flow to add Institutions, then create their Accounts (Assets), Credit Cards (Liabilities), and Reward Programmes as separate entities (PRODUCT.md §3), each with name, currency, opening balance, and expected balance sign.
**Working app:** log in, complete onboarding, and see an Accounts / Net Worth page with correct SGD balances (credit cards shown as negative).

## M2 — Gmail Connection & Raw Sync
Gmail OAuth consent (read-only scope) as an extension of login. Sync job that lists matching messages from configured institution senders and records them (no AI parsing yet). Resolve the OAuth verification question from ARCHITECTURE.md §5 here, not later.
**Working app:** a sync log/debug view showing real emails detected from Gmail, proving the ingestion plumbing before any AI is involved.

## M3 — AI Extraction Pipeline
LLM-based structured extraction turning matched emails into transactions for DBS, UOB, Citibank SG, and OCBC, stored with `source = gmail_import` and the original AI output preserved.
**Working app:** send yourself (or wait for) a real bank notification and watch it appear automatically in a Transactions list — the core "zero manual entry" promise working end to end.

## M4 — Categorisation
Default category set, full CRUD, AI auto-categorisation at ingestion, correction UI, merchant-memory learning.
**Working app:** every transaction has a category; correcting one sticks for that merchant from then on.

## M5 — Budgets & Monthly Summary
Per-category monthly budget limits; spent/limit/remaining/% tracking; overall monthly summary; credit card payments excluded from spend; in-app budget alert banners.
**Working app:** budget status is live and accurate, driven by real imported transactions.

## M6 — Credit Card Reward Engine
Card profile configuration UI (earning rates, bonus categories/caps, cycle type, eligible/excluded merchants, FX rates); the generic rule evaluator; bonus-cap usage and miles-earned computed automatically, backfilled onto M3–M5 transactions.
**Working app:** each card shows real, correctly-computed bonus-cap usage and miles earned.

## M7 — Card Recommendation Engine
On-demand "best card for this context" query; proactive recommendation surfaced in-app; every recommendation includes its reason, sourced from the matched rule's description.
**Working app:** ask "which card for an online dining purchase right now" and get a personalised, explained answer based on your actual wallet and cap usage.

## M8 — Miles & Points Programmes
The 5 day-one reward programmes; manual balance override; transfer-history logging (date, ratio, resulting balances); monthly earning summaries per programme.
**Working app:** a Miles page with real balances and a transfer history you trust.

## M9 — Home Page
Build the primary landing page (PRODUCT.md §4): Net Worth, Cash Available, Credit Card Outstanding, Budget Status, Recent Transactions, Miles Earned This Month — pulling live from the Institutions/Accounts/Credit Cards (M1), Budgets (M5), Rewards (M6–M7), and Miles (M8) modules already built. Dashboard v2 (a later visual-only pass, see VISUAL_DIRECTION.md §10) restructures this into three columns and removes Recommended Card from Home specifically — the recommendation engine itself still ships in M7, surfaced on Wallet instead.
**Working app:** open the app and understand your full financial position within a few seconds — Home is now the default landing page on both desktop and mobile.

## M10 — Duplicates, Corrections & Audit Trail
Duplicate detection with confirm/dismiss; transaction edit UI; original-vs-corrected comparison; full per-transaction audit history view; manual transaction entry as an explicit exception path.
**Working app:** you can fully trust, correct, and trace every transaction's history.

## M11 — Notifications & Activity Centre
Dedicated activity centre aggregating every alert type from M5–M7 (budget, bonus cap, recommendations, import errors), each with actionable copy per PRODUCT.md §6.7.
**Working app:** one place to review everything that happened and everything that needs attention.

## M12 — AI Insights Engine
Scheduled insight generation (PRODUCT.md §5) over existing account/transaction/budget/reward data: spending trends, budget observations, credit card optimisation opportunities, reward earning opportunities. A dedicated Insights feed, kept visibly separate from the Notifications/Activity Centre built in M11.
**Working app:** an Insights feed with real, explained observations about your actual spending and cards — not just numbers restated.

## M13 — Settings
Consolidated Settings section (PRODUCT.md §6.6): Banks, Accounts, Credit Cards, Reward Rules, Categories, Budgets, Notifications, Gmail Connection, AI Settings, Developer Tools — bringing the management screens built incrementally in M1–M12 together into one coherent, navigable area, plus the net-new Developer Tools diagnostics panel.
**Working app:** every entity and system in the app can be configured from one place, with no code changes required for day-to-day changes like adding a card or editing a reward rule.

## M14 — Polish
Mobile refinement pass, empty/error states, performance pass, and the README setup guide finalised for a clean clone-to-running experience on a new machine.
**Working app:** MVP complete — stable and ready for daily use. PWA/installability is intentionally deferred to V2 below; the priority is a stable application first.

---

## After MVP: V2

Only start once the MVP above has been in real daily use and is stable — per PRODUCT.md's Scope Discipline, this order is not fixed and should be reprioritised based on what actually turns out to matter after living with V1:
- **PWA support** — manifest, icons, home-screen installability, offline groundwork. Deliberately deferred from MVP: build a stable application first, then make it installable.
- **AI Insights Engine v2** — subscription analysis, travel spending summaries.
- Additional notification channels (push / email / chat) on top of the existing channel-agnostic alert logic.
- Budget rule engine for merchant exceptions (e.g. Grab sub-service disambiguation).
- Annual fee and sign-up bonus tracking per card.
- Historical transaction backfill, if a reliable source appears.
