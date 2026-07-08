# MilesOS — Technical Architecture

Companion to [PRODUCT.md](./PRODUCT.md), which is the source of truth for *what* to build and *why*. This document defines *how*. Build order lives in [ROADMAP.md](./ROADMAP.md).

Guiding engineering values (from PRODUCT.md, restated here because they drive every choice below): modular, extensible, data-driven instead of hardcoded, easy for a solo developer using AI to maintain, simple before complex, reliable over clever.

## 1. Recommended Stack, and Why

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript, everywhere | One language across frontend, backend, and scripts halves the context a solo dev (and an AI assistant) needs to hold. Also the best-supported language for AI-assisted coding by training-data volume. |
| Framework | Next.js (App Router) | Frontend + backend in one project (pages, API routes, server actions). Enormous ecosystem and AI familiarity. Deploys with zero config to Vercel. Natural path to a PWA in V2 (manifest + service worker) and to React Native later (shared types/logic) without a rewrite. |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) | Accessible, modern, minimal components out of the box — directly serves Principle 5 ("beautiful enough to enjoy opening daily") without needing a designer. Copy-in components (not an npm dependency) means full control and no black-box UI library to fight. |
| Charts | Tremor (or shadcn charts, built on Recharts) | Purpose-built for dashboards: budget bars, spend-over-time, bonus-cap gauges. |
| Database | PostgreSQL | Financial data needs real transactional (ACID) guarantees — this rules out a "just use a document store" shortcut. Mature, boring, reliable. JSONB support handles the data-driven reward-rule config cleanly (§3 below) without sacrificing relational integrity elsewhere. |
| DB hosting | Neon (or Supabase) | Managed Postgres with automated backups/point-in-time recovery (covers the backup assumption in PRODUCT.md §7.2) and a generous free/cheap tier for one user. Neon's branching is convenient for local/preview environments. |
| ORM | Prisma | Strong TypeScript inference, simple migration workflow, and Prisma Studio gives a free "click around the database" admin UI — genuinely useful for eyeballing your own transactions/budgets without building an admin panel. Widely represented in AI training data, which matters for AI-assisted maintenance. |
| Auth | Auth.js (NextAuth) with Google provider | Google OAuth is both the login mechanism and the Gmail consent flow — one sign-in grants both, matching the "industry-standard, least-privilege" requirement. Login is hard-restricted server-side to one allow-listed email address; there is no public sign-up surface. |
| AI extraction | Anthropic Claude API (structured/tool-use output) | Strong at exactly this task: turning messy unstructured text (an HTML bank email) into a strict JSON schema. Called through a small internal interface (see §3) so the provider is swappable without touching ingestion/categorisation logic. |
| Background jobs | Vercel Cron Jobs → API routes | See §6 for the reasoning — this is the one genuinely debatable choice, argued in full below. |
| Deployment | Vercel | Git-push deploys, preview environments per branch, zero server/container to patch or monitor — directly serves "low maintenance" and "no deep DevOps knowledge." |
| Tooling | pnpm, Biome (lint+format in one tool), Vitest | One package manager, one lint/format tool instead of ESLint+Prettier, one fast test runner — fewer moving parts for a solo maintainer. |

## 2. Overall System Architecture

```
                    ┌─────────────────────────────┐
                    │        Next.js App          │
                    │  (Vercel, single deploy)    │
                    │                              │
   Browser  ───────▶│  App Router pages (UI)       │
 (Mac / iPhone)      │  Server Actions / API routes│
                    │                              │
                    │  ┌────────────────────────┐  │
                    │  │  Domain modules         │  │
                    │  │  ingestion / extraction │  │
                    │  │  categorisation         │  │
                    │  │  budgets / rewards       │  │
                    │  │  miles / accounts        │  │
                    │  │  notifications / insights│  │
                    │  └────────────────────────┘  │
                    └───────────┬─────────┬────────┘
                                │         │
                     Vercel Cron│         │Prisma
                    (scheduled  │         │
                     invocation)│         ▼
                                │   ┌─────────────┐
                                │   │  PostgreSQL  │
                                │   │   (Neon)     │
                                │   └─────────────┘
                                │
                    ┌───────────▼───────────┐        ┌──────────────┐
                    │  Gmail API (readonly) │        │ Anthropic API │
                    │  (OAuth, one user)    │◀──────▶│ (extraction)  │
                    └────────────────────────┘        └──────────────┘
```

Everything runs as one Next.js application. There is no separate backend service, no message queue, and no dedicated worker host — deliberately, per "simple before complex." The only thing that makes this feel like more than "a website" is that Vercel Cron periodically calls internal API routes on a schedule, the same way a user's browser would call them on demand.

## 3. Module Boundaries (the "swappable" requirements, made concrete)

Two requirements demand a real interface boundary, not just a folder name: the email-ingestion layer (PRODUCT.md §6.1) and the reward engine (§6.4). Both are designed the same way — a stable internal contract with one concrete implementation today.

**Ingestion:**
```ts
interface TransactionSource {
  fetchNewRawMessages(since: SyncCursor): Promise<RawMessage[]>
}
// Today: GmailTransactionSource implements TransactionSource
// Tomorrow: a different source can be dropped in without touching
// extraction, categorisation, budgets, rewards, or Home.
```

**Reward rules** (the part of the system explicitly required to be data-driven, not hardcoded per card):
```ts
type RewardRule = {
  id: string
  description: string          // human-readable; feeds the "why" in every recommendation
  earnRate: number             // e.g. miles per SGD
  rewardProgram: string        // e.g. "KrisFlyer", "DBS Points"
  conditions: {
    categories?: string[]
    merchants?: { include?: string[]; exclude?: string[] }
    channel?: ('online' | 'offline' | 'mobile_wallet')[]
    foreignCurrencyOnly?: boolean
  }
  cap?: { amount: number; period: 'calendar_month' | 'statement_month' }
  priority: number
}
```
Every card owns a list of these, stored as JSONB and edited through a settings UI — adding, removing, or editing a card never requires a code change (§6.4). A single generic evaluator function matches a transaction against a card's rules and returns both the computed earn amount *and* the matched rule's `description`, which is what makes every recommendation self-explaining "for free" rather than needing separately-authored copy.

The **recommendation engine** simply runs this evaluator hypothetically against every active card for a given purchase context, ranks the results (accounting for each card's remaining bonus-cap headroom), and returns the winner plus the rule description that justified it.

**Notifications** follow the same shape: alert-generation logic (what counts as "approaching a cap," "over budget," etc.) is separate from delivery. V1 has exactly one delivery channel (in-app activity feed); adding push/email/chat later means adding a new delivery implementation, not touching the logic that decides *when* to alert.

**Insights** (the read-only analysis layer, PRODUCT.md §5) follow a third, deliberately simple shape:
```ts
interface InsightGenerator {
  generate(context: AccountSnapshot): Promise<InsightDraft[]>
}
// One implementation per insight type (spending trend, budget observation,
// card optimisation, reward opportunity, subscription, travel summary),
// run on a schedule against current account/transaction/budget/reward state.
```
Generators only read domain data and write `Insight` records (§4) — they never mutate Account, Transaction, Budget, or Reward state. That boundary is what keeps "insights explain, don't own data" (PRODUCT.md §5) concrete rather than aspirational.

## 4. Data Model (entities, not full DDL — the Prisma schema is written during implementation)

- **Institution** — a bank or card issuer (e.g. DBS, UOB, OCBC, Citibank): name, sender-address patterns and display metadata for email matching. Owns Accounts and Credit Cards. (This is the first-class entity PRODUCT.md §3 requires — the sender-pattern config once modelled as a standalone `InstitutionProfile` now lives here instead, since Institutions are something the user manages directly via Settings → Banks, PRODUCT.md §6.6.)
- **Account** (Asset) — belongs to an Institution; type (current/savings/cash), currency, opening balance, current balance (derived).
- **CreditCard** (Liability) — belongs to an Institution as its own top-level entity, not a subtype of Account (PRODUCT.md §3, since it behaves differently: balance owed, statement/calendar cycles, reward rules, a bonus cap); currency, opening/current balance (derived, negative), cycle type (calendar/statement) and cycle start day; holds a list of `RewardRule` (JSONB, §3 above).
- **Transaction** — two nullable foreign keys, `accountId` and `creditCardId`, with exactly one populated per row (the simplest way Postgres/Prisma model "belongs to one of two entity types" without a discriminated-union hack); date, amount, currency, sgdAmount, fxRate, `fxEstimated`, merchant (raw + normalised), categoryId, `source` (`gmail_import` | `manual`), `isForeignCurrency`, duplicate-flag fields.
- **RawEmailExtraction** — the untouched AI output for a transaction (gmailMessageId, raw JSON, model used, timestamp) — this is what makes "preserve the original data" (§6.8) a clean separate record rather than shadow columns bolted onto `Transaction`.
- **TransactionAuditLog** — append-only log of every change to a transaction (field, old value, new value, changed-by-system-or-user, timestamp) — the audit trail required by §6.8.
- **Category** — name, monthly budget limit (nullable = no budget set).
- **MerchantCategoryRule** — normalised merchant → category, the "learned correction" memory from §6.3.
- **RewardProgram** / **RewardBalance** — the 5 day-one programmes and current balances (with manual-override timestamps). A `RewardProgram` is a first-class entity independent of any Credit Card (PRODUCT.md §3); it's earned into by one or more `CreditCard`s via their `RewardRule.rewardProgram` reference.
- **RewardTransfer** — from-program, to-program, date, ratio, source amount, resulting amount — the permanent transfer-history ledger from §6.5.
- **Insight** — id, type (`spending_trend` | `budget_observation` | `card_optimisation` | `reward_opportunity` | `subscription` | `travel_summary`), title, narrative body (the "why it matters" text), related entity reference, period covered, generated-at, read/dismissed state. Deliberately a separate table from `NotificationItem` (PRODUCT.md §5 vs §6.7): different lifecycle (generated on a schedule, not triggered by a single event) and a longer-form body.
- **NotificationItem** — type, title, message, recommended action, reason, related entity, read state — backs the activity centre (§6.7).
- **AiSettings** — single-row app config (this is a single-user app): which Insight types are enabled, generation cadence, extraction/categorisation confidence behaviour. Backs Settings → AI Settings (PRODUCT.md §6.6).
- **GmailSyncState** — last historyId / cursor, last synced timestamp, last error — powers both the sync job and the "connection needs re-authorising" health check (see §7.4 risk in PRODUCT.md).

## 5. Gmail Integration

- **Auth & scope:** Google OAuth via Auth.js, requesting `gmail.readonly` (the narrowest scope that still allows reading email bodies — `gmail.metadata` isn't sufficient since transaction details live in the body) alongside the standard sign-in scopes, in one consent flow.
- **Self-imposed narrowing:** even though the granted scope is technically broad, the app never lists or reads mail outside senders matching a configured `Institution`'s sender patterns — it queries Gmail with sender/subject filters (`from:` a known bank address) rather than scanning the whole mailbox. This is documented explicitly as the least-privilege posture referenced in PRODUCT.md §6.11, since OAuth scopes alone can't express "only these senders."
- **Sync mechanism:** polling via the Gmail History API using a stored `historyId` cursor, run on a schedule (see §6) rather than a Pub/Sub push subscription. Push delivery (`watch()` + Cloud Pub/Sub) is lower-latency but requires standing up a Google Cloud Pub/Sub topic, a public webhook endpoint, and subscription renewal every 7 days — meaningfully more moving parts for a personal app where a few minutes of latency on a transaction email is irrelevant. Polling is the "simple before complex" choice; push can be revisited if latency ever actually matters.
- **⚠️ Verification risk (flagged in PRODUCT.md §7.4):** `gmail.readonly` is a Google "restricted scope." An unverified app left in "Testing" publishing status risks refresh tokens expiring (historically ~7 days), which would break "run continuously" outright. Plan: pursue Google's OAuth verification for this scope as part of the Gmail-integration milestone (one-time effort, since this is a single, narrowly-scoped use case); as a safety net regardless of verification outcome, build a `GmailSyncState`-backed health check that surfaces a clear in-app "reconnect Gmail" prompt the moment a token is invalid, so the failure mode is a 30-second manual reconnect rather than silent data loss.
- **Data minimisation:** account numbers extracted from emails are truncated to last-4-digits at extraction time; full numbers are never persisted.

## 6. Background Jobs & Scheduling

Chosen mechanism: **Vercel Cron Jobs calling internal API routes**, over a separately-hosted long-running worker process. Reasoning: the workload (polling one mailbox, running a handful of LLM extractions, recomputing some aggregates) is small and bursty, not continuous — it doesn't need a process that's "always on" in the literal sense, only one that's invoked reliably on a schedule. This avoids operating a second host/container entirely, which is the single biggest lever on "low maintenance" for a one-person project. If Vercel's function execution limits ever become a real constraint (unlikely at personal-mailbox volume), the same job logic can be lifted into a small persistent worker later without touching the domain modules that do the actual work.

Scheduled jobs:
1. **Gmail sync** (every 5 minutes) — fetch new matching messages, run AI extraction, categorise, detect duplicates, persist transactions + audit entries.
2. **Alert reconciliation** (immediately following sync) — recompute budget/bonus-cap status against latest transactions, create/update `NotificationItem`s.
3. **Gmail connection health check** (daily) — proactively verify the stored token still works; raise an in-app alert if not (§5).
4. **Month-end snapshot** (once, at each calendar month boundary in SGT) — lightweight archival of the prior month's summary, for historical reporting stability even if budget limits change later.
5. **Insight generation** (daily or weekly, per `AiSettings` cadence — PRODUCT.md §7.2 assumption) — run each enabled `InsightGenerator` (§3) over current account/transaction/budget/reward state and write new `Insight` records.

## 7. AI Transaction Extraction Pipeline

1. Cron triggers the sync route.
2. `GmailTransactionSource` lists new messages since the stored cursor, filtered to configured institution sender patterns.
3. For each message: convert to plain text, call the Anthropic API with a forced JSON schema (tool use) requesting amount, currency, merchant, date/time, masked account identifier, transaction type, channel hints (online/mobile-wallet, if present in the email), and foreign-currency details if present.
4. Match the extracted account identifier against the user's configured `Account` records.
5. Look up `MerchantCategoryRule` for the normalised merchant; apply if found, otherwise let the same extraction call suggest a category from the user's existing category list (never an invented one).
6. Run duplicate detection (same account + similar amount + close timestamp) — flag, never auto-merge.
7. Persist `Transaction` + `RawEmailExtraction` (original AI output preserved verbatim) + initial `TransactionAuditLog` entry (`imported_from_gmail`).
8. Reward engine runs against the new transaction to update bonus-cap usage and miles earned (computed on read, per PRODUCT.md §7.2 assumption — no separate write-time counters to keep in sync).

## 8. Security Considerations

- Least privilege everywhere: Gmail scope self-narrowed to known senders (§5); database credentials and API keys live only in Vercel's encrypted environment variables, never in code or git history.
- Single-user enforcement at the auth layer (hard-coded allow-list of one Google account email — not a "first user to sign up" pattern).
- Account numbers masked to last 4 digits at extraction time; never store full numbers.
- All traffic over TLS (Vercel + Neon both default to this).
- Backups: rely on Neon's automated point-in-time recovery rather than custom tooling (§7.2 assumption in PRODUCT.md).
- Dependency hygiene: Dependabot (or Renovate) enabled on the repo for low-effort ongoing patching — the only "ongoing maintenance" task this architecture asks of the user.
- Developer Tools (PRODUCT.md §6.6) exposes raw extraction logs and audit data, but sits behind the same single-user auth as the rest of the app — it's a diagnostics panel, not a separate access tier.

## 9. Folder Structure

```
milesos/
├── app/                        # Next.js App Router
│   ├── (dashboard)/             # main authenticated app: home, transactions, budgets, cards, miles,
│   │                             #   insights, settings/{banks,accounts,cards,reward-rules,categories,
│   │                             #   budgets,notifications,gmail,ai,developer}
│   ├── (onboarding)/            # first-run entity setup: institutions, accounts, credit cards, reward programmes
│   └── api/
│       ├── cron/
│       │   ├── sync-gmail/route.ts
│       │   ├── reconcile-alerts/route.ts
│       │   ├── health-check/route.ts
│       │   └── generate-insights/route.ts
│       └── auth/[...nextauth]/route.ts
├── src/
│   ├── modules/                 # one folder per domain, each with its own types/logic
│   │   ├── ingestion/            # TransactionSource interface + gmail/ implementation
│   │   ├── extraction/           # AI client interface + prompt templates
│   │   ├── categorisation/       # category CRUD + merchant memory
│   │   ├── budgets/
│   │   ├── rewards/              # card profiles, rule evaluator, recommendation engine
│   │   ├── miles/                # programs, balances, transfers
│   │   ├── accounts/             # institutions, accounts (assets), credit cards (liabilities)
│   │   ├── notifications/
│   │   ├── insights/             # InsightGenerator implementations + Insight persistence
│   │   └── shared/               # currency conversion, date/period helpers, shared types
│   ├── lib/                      # db.ts (Prisma client), auth.ts, ai-client.ts
│   └── components/               # shadcn-based shared UI
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
├── .env.example
└── README.md
```

Settings (PRODUCT.md §6.6) is a UI surface, not its own module — each settings screen calls into the domain module that already owns that data (Banks/Accounts/Credit Cards → `accounts`, Reward Rules → `rewards`, Categories/Budgets → `budgets`, Notifications → `notifications`, Gmail Connection → `ingestion`, AI Settings → `insights`/`extraction`, Developer Tools → read-only views across all of the above).

`public/manifest.json` and any service worker (PWA groundwork) are intentionally not part of the v1 folder structure — added in V2 per PRODUCT.md §8, once the application is stable.

## 10. Development Workflow

- **Local setup:** clone → `pnpm install` → copy `.env.example` to `.env.local` and fill in secrets (Google OAuth client, Anthropic key, database URL) → `pnpm prisma migrate dev` → `pnpm dev`. This sequence is exactly what the "clone and follow a simple setup guide" requirement (PRODUCT.md §6.10) needs to satisfy, and becomes the README.
- **Branching:** trunk-based with short-lived feature branches; Vercel automatically builds a preview deployment per branch, which is useful even solo for testing a change against production data shape before merging.
- **Schema changes:** via `prisma migrate dev` locally, applied to production with `prisma migrate deploy` during deploy.
- **Testing:** Vitest for the modules where correctness actually matters most — the reward rule evaluator, currency conversion, budget aggregation, categorisation memory. Not chasing high coverage or e2e infrastructure for its own sake; the win is confidence in the few places bugs would be expensive (silently wrong money math).
- **Lint/format:** Biome, one tool, one config, run in a pre-commit hook.
