# MilesOS — Product Requirements Document (PRD)

This is the single source of truth for what MilesOS is, why it exists, and what it must do. It is a living document — update it as requirements evolve, and never let engineering decisions silently diverge from it. Companion documents: [ARCHITECTURE.md](./ARCHITECTURE.md) (how it's built) and [ROADMAP.md](./ROADMAP.md) (build order).

## 1. Overview

MilesOS is a personal finance operating system, built for single-user use only (not a commercial product). It automatically tracks spending across bank accounts and credit cards with zero manual input, and helps manage budgets, optimise credit card rewards, and maximise airline miles.

## 2. Core Product Principles

These principles guide every design and engineering decision. When a decision isn't obvious, it should be resolved by asking which option these principles favour.

1. **Zero manual data entry.** Transactions must never require the user to type, upload, or copy-paste data in. (Manual correction and a manual-entry fallback exist — see §7 — but they are explicitly exceptions to this principle, not a contradiction of it: the normal path for the vast majority of transactions must remain fully automatic.)
2. **Automation before features.** Reliable automation of existing capabilities takes priority over adding new ones.
3. **One source of truth for every transaction.** No duplicate or conflicting records of the same real-world transaction. (This governs the *current* record, not history — preserving the original AI-extracted data alongside a user correction, per §7, is audit trail, not a second source of truth.)
4. **Credit card optimisation is a first-class feature, not an afterthought.** It's designed in from the start, not bolted on later.
5. **The interface should be beautiful enough that I enjoy opening it every day.** Design quality is a functional requirement, not polish.

## 3. Requirements

### 3.1 Data Ingestion
- Transactions are imported automatically by reading transaction notification emails from Gmail (email notifications are enabled for every transaction on every account/card in scope).
- The system connects to Gmail, detects new transaction emails, uses AI to extract transaction details, and saves them to the database.
- No manual CSV import or manual data entry as the normal workflow.
- Day-one bank/card support: DBS credit cards, UOB credit cards, Citibank Singapore credit cards, OCBC bank accounts.
- Must be modular so more banks/email formats can be added later.
- The email-ingestion layer must be completely independent from the rest of the app (budgeting, dashboard, credit card optimisation), behind a swappable interface, so the data source could be replaced in the future without touching those features.

### 3.2 Platform & Access
- Responsive web application, works seamlessly on desktop and mobile browsers.
- Should feel like a modern native app — clean, fast, minimal — not a traditional website.
- Daily use on both Mac and iPhone.
- Eventually deployed for secure access from anywhere over the internet.
- Architecture should support evolving into a PWA or native mobile app later without major rework.
- Desktop experience prioritises detailed analysis and planning. Mobile experience prioritises quick checks: budgets, recent transactions, credit card recommendations, bonus spend progress.

### 3.3 Budgeting
- Category-based monthly budgets.
- Every transaction is automatically categorised by AI based on merchant and transaction details.
- User can review, correct, and rename categories. Corrections are remembered so future transactions from the same merchant are categorised correctly going forward.
- Category list is fully customizable: create, edit, merge, delete at any time.
- Each category has its own monthly budget, tracked automatically, showing: amount spent, budget limit, remaining budget, percentage used.
- Alerts when approaching or exceeding a budget.
- Budget period = calendar month (also aligns with credit card bonus spend tracking periods — though note §3.4, individual cards may cycle on a *statement* month instead).
- Overall monthly spending summary in addition to per-category budgets.
- Actual spending must be separated from credit card payments — paying off a credit card balance is a transfer, not a new expense, and must never be double-counted against a budget.

### 3.4 Credit Card Optimisation
Core feature, not an afterthought (Principle 4).

**Per-card profile** (configurable through the app, never hardcoded — cards can be added/removed/edited without code changes, since the wallet evolves over time):
- Earning rates (e.g. miles per dollar)
- Bonus categories
- Monthly bonus caps
- Calendar month vs. statement month cycle rules
- Eligible and excluded merchants
- Foreign currency earning rates
- Annual fees *(field reserved for V2 — see §5)*
- Sign-up bonuses *(field reserved for V2 — see §5)*

**Automatic calculations:** bonus spend used and remaining per card; miles earned; best card to use for a given purchase, computed from the user's own wallet (never generic advice).

**Recommendation engine inputs:** merchant, transaction category, online vs. offline, mobile wallet payment, current bonus cap utilisation, each card's special earning rules.

**Recommendations must always explain why**, e.g.:
- "Use DBS Woman's World because this is an online purchase and you still have S$240 of bonus spend remaining this month."
- "Use UOB Preferred Platinum Visa because this mobile wallet transaction still qualifies for 4 mpd."
- "Use DBS Altitude because you have already reached your bonus cap on the other cards."

**Delivery:** on-demand recommendations available in-app; proactive notifications when approaching a bonus cap, reaching a bonus cap, or when a better card should be used for the remainder of the month.

**Architecture implication:** the reward engine must be data-driven/configurable per card (rules, caps, rates editable through the app), not hardcoded per-card logic.

### 3.5 Miles & Points Tracking
First milestone = tracking, not redemption planning.

**Day-one loyalty programmes:** Singapore Airlines KrisFlyer, DBS Points, UOB UNI$, Citi ThankYou Points / Citi Miles, HeyMax Miles.

**Automatic calculations:** miles/points earned per transaction; total points/miles earned by programme; estimated transferable miles; monthly earning summaries.

**Other requirements:**
- Manual balance update supported, for when the user needs to correct/sync a balance by hand.
- Airline miles and bank reward points are separate assets (bank points aren't always transferred immediately — don't conflate "earned" with "transferred").
- Full history of every point conversion/transfer: transfer date, transfer ratio, and resulting balances on both sides, preserved permanently.

### 3.6 Deployment & Hosting
- Priorities: reliable and secure, low maintenance, affordable for a single personal user, easy to develop/extend with AI-assisted coding, able to run continuously (for automatic Gmail polling).
- Deploying updates must not require deep DevOps knowledge.
- Must be easy to stand up on a new machine: clone the repo, follow a simple setup guide, get the whole app running with minimal configuration.
- (Specific platform/database choice is made in [ARCHITECTURE.md](./ARCHITECTURE.md).)

### 3.7 Security & Privacy
- Single-user app: "practical" security appropriate for a personal financial app, not enterprise-grade. No multi-user access, role-based permissions, or audit logs needed for their own sake.
- Gmail access is read-only, scoped to the minimum necessary — principle of least privilege applies generally, not just to Gmail.
- LLM API use for email/transaction extraction is acceptable, provided emails are used only for structured data extraction and not retained unnecessarily.
- Secrets, API keys, and OAuth credentials must never be hardcoded — must be externally configured/managed.
- Authentication uses secure industry-standard methods (e.g. Google OAuth), since the app is internet-reachable.
- Top priority: financial data stays private to the user.
- Technical security decisions that don't affect UX use sensible defaults chosen at the architecture stage.

### 3.8 Notifications & Alerts
- First milestone: all notifications delivered in-app only.
- Dashboard must clearly surface: budgets approaching limit, budgets exceeded, bonus caps approaching, bonus caps reached, better card recommendations, transaction import errors.
- Dedicated notifications/activity centre to review recent alerts and recommendations.
- Alert logic must be decoupled from delivery channel, so push/email/chat-app integrations can be added later without changing the underlying alert logic.
- Every notification must be actionable, not just informational — pair the alert with a concrete recommendation/next step and the reason behind it (e.g. not "bonus cap reached" alone, but "bonus cap reached → recommended card: X → reason: Y"; not "Food budget 92%" alone, but paired with the remaining amount).

### 3.9 Accounts & Onboarding
- No historical backfill in v1 — transaction history starts from whenever transaction-notification emails became available. Historical import from another source is a possible future feature, not v1.
- Onboarding lets the user manually enter starting balances for every bank account, credit card, reward-points programme, and airline-miles programme.
- Each account configured with: account name (e.g. "OCBC 360", "DBS Woman's World"), institution, account type (current, savings, credit card, rewards account, airline programme), currency, opening balance, and whether positive or negative balances are the expected default for that account.
- Credit cards are liabilities: balances stored/displayed as negative values representing amount owed.
- After onboarding, balances are kept up to date automatically from incoming transaction emails — no ongoing manual entry.

### 3.10 Corrections, Duplicates & Manual Entry
- Automation is always the default; manual correction is available when needed (not the normal workflow).
- User can directly edit a transaction if AI parsed it wrong. The original AI-extracted data is always preserved alongside the corrected version, so the two can be compared later.
- The system learns from corrections where possible (ties into merchant-category memory, §3.3).
- Potential duplicates (e.g. an authorization hold followed by its final settlement) are detected and flagged, but never auto-merged/removed — user confirmation is required first.
- Manual transaction entry is supported as a fallback for spending that never generates an email, but this is explicitly an exception path.
- Every transaction records whether it was automatically imported or manually created.
- Every transaction has a full audit history of what happened to it over time (imported from Gmail → AI-parsed → merchant corrected → category changed, etc.), traceable at any point in the future.

### 3.11 Currency Handling
- SGD is the primary reporting currency throughout the app. All budgets, spending summaries, cash flow, and net worth calculations are displayed in SGD.
- Foreign-currency transactions retain their original amount and currency, and also store the SGD equivalent.
- SGD equivalent uses the actual converted amount charged by the bank wherever the email/statement provides it (reflects real cost including FX fees).
- If the bank doesn't provide an SGD equivalent, estimate one using the exchange rate at the time of the transaction, and clearly mark it as an estimate until a final posted amount is available.
- Transaction detail view always shows: original amount + currency, SGD equivalent, and exchange rate used (if available).
- Every transaction records whether it's a foreign-currency transaction, even though v1 reporting is SGD-only, so future versions can analyse overseas spend/FX fees/travel by country without a data model change.

## 4. PRD Review

### 4.1 Contradictions
None found. The one apparent tension — "zero manual data entry" (Principle 1) vs. manual correction/manual-entry fallback (§3.10) — is already resolved explicitly in the requirements: automation is the default and manual paths are a named exception, not a competing workflow. This resolution is now stated directly in Principle 1 above so it can't be misread in isolation later.

### 4.2 Assumptions Made
Flagging these so they can be corrected if wrong — none of them blocked writing the PRD, but they shape the architecture:
- **Timezone for "calendar month."** Assumed Asia/Singapore (SGT) defines month/day boundaries for budgets and scheduled jobs, since all supported institutions and the user are Singapore-based.
- **Default category set.** A starter list will be seeded (e.g. Groceries, Dining, Transport, Shopping, Entertainment, Travel, Utilities, Health, Subscriptions, Uncategorised) — fully editable per §3.3, so the exact starting list isn't a critical decision.
- **Aggregates computed on-demand.** Budget totals, bonus-cap usage, and miles totals are computed by querying transactions directly rather than maintained as running counters. At personal-scale data volume this is simpler and avoids cache-invalidation bugs; revisit only if it ever becomes a real performance problem (unlikely).
- **Gmail sync interval.** Assumed near-real-time via periodic polling (every few minutes) rather than true push delivery — see §4.4.
- **Backup/disaster recovery.** Not explicitly specified. Assumption: rely on the managed database provider's automated backups/point-in-time recovery for v1, rather than building custom backup tooling. This satisfies "reliable" without adding engineering effort disproportionate to a personal app.
- **No additional login factor beyond Google OAuth.** Given the "practical security" bar and single-user scope, Google OAuth restricted to one allow-listed email address is assumed sufficient without an extra PIN/password layer.

### 4.3 Decisions That Significantly Affect Architecture
- **Reward rule modelling.** Because card rules must be data-driven and never hardcoded (§3.4), the reward engine needs a general rule schema (conditions + rates + caps + priority) evaluated generically for any card, rather than per-card code paths. Getting this schema right early matters — it's the hardest part of the system to retrofit. Addressed in ARCHITECTURE.md.
- **Reward period vs. budget period.** Budgets are always calendar-month (§3.3), but individual cards may cycle on a statement month (§3.4). The engine must track these as independent period boundaries per card, not assume they're the same clock.
- **AI extraction provider.** Whichever LLM API is used for email parsing should sit behind an internal interface, so it can be swapped without touching ingestion/categorisation logic — same "swappable" discipline already required for the Gmail source itself.
- **Hosting model (serverless vs. persistent process).** Whether Gmail sync runs as a scheduled serverless invocation or a long-running worker process changes how "run continuously" is satisfied operationally. Addressed and decided in ARCHITECTURE.md.

### 4.4 A Risk Worth Flagging Explicitly
Google treats full Gmail read access (`gmail.readonly`) as a "restricted scope." Apps that aren't fully verified by Google and are left in "Testing" publishing status can have their granted refresh tokens expire (historically ~7 days), which would silently break automatic sync and require repeated manual re-authentication — directly undermining "run continuously" (§3.6) and "zero manual data entry" (Principle 1). This needs to be resolved early in the Gmail-integration milestone, not discovered later. Mitigation plan (detailed in ARCHITECTURE.md): attempt Google's OAuth verification for this scope up front since it's a one-time cost; as a fallback, build a fast "reconnect Gmail" flow and a health-check job that surfaces a clear in-app alert the moment the connection needs re-authorising, so the worst case is a 30-second manual step rather than silent failure.

## 5. Scope: MVP (V1), V2, Future Ideas

### MVP (V1) — everything required for a daily-usable core system
- Google OAuth login (single allow-listed user) + Gmail read-only connection.
- Onboarding: accounts (bank/card/rewards/airline) with starting balances, currency, type.
- Gmail ingestion pipeline for DBS, UOB, Citibank SG, OCBC → AI-extracted transactions.
- Category system: default categories, full CRUD, AI auto-categorisation, per-merchant correction memory.
- Category budgets: monthly, calendar-month, spent/limit/remaining/%, in-app alerts, overall monthly summary. Credit card payments excluded from spend (§3.3).
- Credit card profiles (data-driven config) + reward engine: bonus cap tracking, miles earned, "best card" recommendation with explanation, on-demand + proactive in-app alerts.
- Miles/points tracking for the 5 day-one programmes: per-transaction earning, totals by programme, manual balance override, transfer history log.
- Transaction detail, edit, original-vs-corrected comparison, full audit history, duplicate flagging with confirm/dismiss, manual transaction entry (exception path), import-source tagging.
- Currency handling: SGD reporting, original amount/currency preserved, SGD equivalent (actual or estimated + marked), FX flag.
- Net worth / accounts overview (sum of account balances, credit cards as liabilities, all in SGD).
- Dashboard + in-app notifications/activity centre.
- Responsive web UI (desktop + mobile browser) with PWA-ready foundation (manifest/icons), not full offline PWA yet.

### V2 — planned near-term extensions, after MVP is stable and in daily use
- Additional notification channels (push, email, chat-app) — built on top of the channel-agnostic alert logic already required in MVP.
- Budget rule engine for merchant exceptions (e.g. disambiguating a single merchant like Grab into Dining vs. Transport by sub-service).
- Annual fee tracking per card (amount, waiver conditions, renewal reminders).
- Sign-up bonus tracking per card (minimum spend requirement, deadline, progress).
- Historical transaction backfill, if a reliable historical data source becomes available.

### Future Ideas — unscheduled backlog
- Redemption planning (when/how to redeem miles).
- Award availability search/tracking.
- Hotel loyalty programmes.
- Transfer partner analysis (which bank points transfer to which airline/hotel programmes, at what ratio).
- Redemption recommendations.
- Foreign-currency spend analytics: trip/country-level breakdowns, total FX fees paid, best card for overseas spend.
- Native mobile app / full offline PWA.

## 6. Scope Discipline

Whenever a future feature or idea is identified that is out of scope for the current milestone, it must be recorded in §5 (V2 or Future Ideas) instead of expanding the scope of the current milestone. Do not redesign or re-scope in-progress work in reaction to a new idea — capture it and keep moving.
