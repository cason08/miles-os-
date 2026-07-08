# MilesOS — Development Roadmap

Build order for the MVP defined in [PRODUCT.md](./PRODUCT.md) §5, using the architecture in [ARCHITECTURE.md](./ARCHITECTURE.md). Each milestone ends with something real to open in a browser and test — no milestone is "just plumbing" with nothing to look at.

## M0 — Project Scaffolding
Next.js + TypeScript app, Tailwind + shadcn/ui installed, Prisma connected to a Neon Postgres instance, deployed to Vercel. A single health-check page confirming the full chain (browser → app → database → deploy) works.
**Working app:** a deployed, blank MilesOS reachable over the internet, proving the whole pipeline before any feature is built.

## M1 — Auth & Onboarding
Google OAuth login restricted to the one allow-listed account. Onboarding flow to create accounts (bank/card/rewards/airline) with name, institution, type, currency, opening balance, and expected balance sign.
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
**Working app:** the dashboard shows live, accurate budget status driven by real imported transactions.

## M6 — Credit Card Reward Engine
Card profile configuration UI (earning rates, bonus categories/caps, cycle type, eligible/excluded merchants, FX rates); the generic rule evaluator; bonus-cap usage and miles-earned computed automatically, backfilled onto M3–M5 transactions.
**Working app:** each card shows real, correctly-computed bonus-cap usage and miles earned.

## M7 — Card Recommendation Engine
On-demand "best card for this context" query; proactive recommendation on the dashboard; every recommendation includes its reason, sourced from the matched rule's description.
**Working app:** ask "which card for an online dining purchase right now" and get a personalised, explained answer based on your actual wallet and cap usage.

## M8 — Miles & Points Programmes
The 5 day-one reward programmes; manual balance override; transfer-history logging (date, ratio, resulting balances); monthly earning summaries per programme.
**Working app:** a Miles page with real balances and a transfer history you trust.

## M9 — Duplicates, Corrections & Audit Trail
Duplicate detection with confirm/dismiss; transaction edit UI; original-vs-corrected comparison; full per-transaction audit history view; manual transaction entry as an explicit exception path.
**Working app:** you can fully trust, correct, and trace every transaction's history.

## M10 — Notifications & Activity Centre
Dedicated activity centre aggregating every alert type from M5–M7 (budget, bonus cap, recommendations, import errors), each with actionable copy per PRODUCT.md §3.8.
**Working app:** one place to review everything that happened and everything that needs attention.

## M11 — Polish & PWA Groundwork
Mobile refinement pass, manifest + icons for home-screen installability, empty/error states, performance pass, and the README setup guide finalised for a clean clone-to-running experience on a new machine.
**Working app:** MVP complete — installable on the iPhone home screen, ready for daily use.

---

## After MVP: V2

Only start once the MVP above has been in real daily use and is stable — per PRODUCT.md's Scope Discipline, this order is not fixed and should be reprioritised based on what actually turns out to matter after living with V1:
- Additional notification channels (push / email / chat) on top of the existing channel-agnostic alert logic.
- Budget rule engine for merchant exceptions (e.g. Grab sub-service disambiguation).
- Annual fee and sign-up bonus tracking per card.
- Historical transaction backfill, if a reliable source appears.
