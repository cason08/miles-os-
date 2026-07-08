# MilesOS — Navigation & Information Architecture

This document defines how MilesOS is *organised* — every page, why it exists, how they connect, and how the app is entered and used day to day. It does not define how anything *looks*: no layout, no visual design, no wireframes. Companion documents: [PRODUCT.md](./PRODUCT.md) (what to build and why), [ARCHITECTURE.md](./ARCHITECTURE.md) (how it's built), [ROADMAP.md](./ROADMAP.md) (build order).

A naming note before anything else, since three of the primary pages map directly onto the Core Entities in PRODUCT.md §3: **Accounts** = Asset accounts, **Wallet** = Credit Cards (Liabilities), **Rewards** = Reward Programmes. Institutions ("Banks") are not a primary page — they're a grouping/management concept, surfaced inside Accounts and Wallet and managed in Settings.

## 1. Primary Navigation

Eight top-level pages. Every one of them exists because it answers a question none of the others fully answer.

| Page | Why it exists | Problem it solves |
|---|---|---|
| **Home** | A single always-current snapshot of my whole financial position. | "How am I doing overall?" shouldn't require visiting five pages to answer. |
| **Accounts** | Manage and review Asset accounts (bank/cash) as their own entity, separate from what I owe. | "How much cash do I actually have, and where is it?" |
| **Wallet** | Manage and review Credit Cards (Liabilities) and get told which one to use. | "What do I owe, and which card should I be using right now?" |
| **Transactions** | The single searchable ledger of everything that happened, across every Account and Credit Card. | "What did I actually spend on X?" and "is this transaction right?" |
| **Budgets** | Track monthly category spend against limits. | "Am I on track this month, and where am I about to overspend?" |
| **Rewards** | Track miles/points balances and transfers, independent of which card earned them. | "How many miles do I have, and where did they come from or go to?" |
| **Insights** | A proactive feed of AI-generated analysis that explains patterns, not just numbers. | "What should I actually know or do that I haven't noticed myself?" |
| **Settings** | The single management surface for every configurable entity and system. | "Where do I change/add/fix something?" |

**Notifications / Activity Centre** exists (PRODUCT.md §6.7) but is deliberately *not* a ninth primary-nav page — see §2 and §3 for why.

## 2. Navigation Hierarchy

Home is the root. The other seven primary pages are peers, always reachable from it and from each other via the persistent nav (§6, §7). Most pages have one level of drill-down (a detail page for a single entity), and drill-downs link back up to their parent and sideways to related pages rather than forming a deep tree.

```
Home
├─ Accounts
│   └─ Account Detail
├─ Wallet
│   └─ Credit Card Detail
├─ Transactions
│   └─ Transaction Detail
├─ Budgets
│   └─ Category Detail
├─ Rewards
│   └─ Reward Programme Detail
├─ Insights
│   └─ Insight Detail
└─ Settings
    ├─ Banks
    ├─ Accounts
    ├─ Credit Cards
    ├─ Reward Rules
    ├─ Categories
    ├─ Budgets
    ├─ Notifications
    ├─ Gmail Connection
    ├─ AI Settings
    └─ Developer Tools

Notifications / Activity Centre — global, reachable from every page via a
persistent header icon, not nested under any of the above.
```

The rule of thumb: **Home teases, the primary pages summarise, detail pages explain.** Home never shows more than the single most relevant transaction/insight/notification; the primary pages (Transactions, Insights, Notifications) are where the full list lives.

## 3. Pages

Each page below defines: **Purpose**, **Primary questions it answers**, **Information shown**, **Actions available**, **Related pages**.

### Home
- **Purpose:** the default landing page — a snapshot of current state, not a feed.
- **Primary questions:** "How am I doing overall?" "Is there anything urgent right now?" "What should I do today?"
- **Information shown:** Net Worth, Cash Available, Credit Card Outstanding, Budget Status (overall + categories closest to their limit), Recent Transactions, Recommended Card (with reason), Miles Earned This Month, at most one teased Notification and one teased Insight.
- **Actions:** tap any figure to drill into its owning page (Net Worth → Accounts/Wallet, Cash Available → Accounts, Credit Card Outstanding → Wallet, Budget Status → Budgets, a transaction → Transaction Detail, Recommended Card → Wallet, Miles Earned → Rewards); open the teased notification/insight.
- **Related pages:** Accounts, Wallet, Transactions, Budgets, Rewards, Insights, Notifications.

### Accounts
- **Purpose:** manage and review every Asset account.
- **Primary questions:** "How much cash do I have, and in which accounts?" "Is a balance out of date or wrong?"
- **Information shown:** Asset accounts grouped by Institution; per account: current balance, currency, last-synced indicator; total Cash Available.
- **Actions:** open Account Detail; add an account (→ Settings › Accounts); archive an account.
- **Related pages:** Account Detail, Wallet (the liabilities counterpart), Transactions (filtered to an account), Settings › Accounts, Settings › Banks.

**Account Detail** (drill-down)
- **Purpose:** the full picture of one Asset account.
- **Primary questions:** "What's happened in this account recently?" "How has the balance moved over time?"
- **Information shown:** balance, institution, currency, opening balance, balance-over-time, recent transactions for this account.
- **Actions:** edit metadata (name, expected balance sign); view all transactions for this account; archive.
- **Related pages:** Transactions (filtered), Settings › Accounts, Settings › Banks.

### Wallet
- **Purpose:** manage and review every Credit Card and see how each is being optimised.
- **Primary questions:** "How much do I owe, and on which cards?" "Which card should I use right now?" "How close am I to a bonus cap?"
- **Information shown:** Credit Cards grouped by Institution; per card: balance owed, cycle type/dates, bonus-cap usage, miles earned this cycle; total Credit Card Outstanding; the current Recommended Card and its reason.
- **Actions:** open Credit Card Detail; ask "which card for this purchase" on demand; add a card (→ Settings › Credit Cards); archive a card.
- **Related pages:** Credit Card Detail, Accounts (the assets counterpart), Rewards (programmes each card earns into), Transactions (filtered), Settings › Credit Cards, Settings › Reward Rules.

**Credit Card Detail** (drill-down)
- **Purpose:** the full picture of one card, including its reward configuration and current recommendation status.
- **Primary questions:** "How much bonus spend do I have left this cycle?" "Why is/isn't this card being recommended right now?" "How many miles has it earned?"
- **Information shown:** balance owed, cycle dates, bonus categories and cap usage, earning-rate table, miles earned this cycle/month, linked Reward Programme(s), recent transactions on this card.
- **Actions:** edit the card's profile (→ Settings › Credit Cards / Reward Rules); view its full transaction list.
- **Related pages:** Settings › Credit Cards, Settings › Reward Rules, Rewards (linked programme), Transactions (filtered).

### Transactions
- **Purpose:** the single searchable ledger of every transaction, across every Account and Credit Card — the system of record.
- **Primary questions:** "What did I spend on X?" "Did this get parsed correctly?" "Is this a duplicate?"
- **Information shown:** chronological, filterable list (by account/card, category, date range, foreign-currency flag, import source); per row: merchant, amount + SGD equivalent, category, account/card, source badge, duplicate flag.
- **Actions:** filter/search; open Transaction Detail; correct a category/merchant inline; add a manual transaction; confirm/dismiss a flagged duplicate.
- **Related pages:** Transaction Detail, Accounts/Wallet (the source account/card), Budgets (the category), Settings › Categories.

**Transaction Detail** (drill-down)
- **Purpose:** everything about one transaction, including its full history.
- **Primary questions:** "What did the AI originally extract, versus what's recorded now?" "What has happened to this transaction over time?"
- **Information shown:** original amount + currency, SGD equivalent + FX rate, merchant (raw + normalised), category, account/card, source, original-vs-corrected comparison, full audit history, duplicate-candidate details if flagged.
- **Actions:** edit/correct fields; confirm/dismiss a duplicate match; view raw email extraction.
- **Related pages:** the parent Account/Credit Card, Settings › Categories, Settings › Developer Tools.

### Budgets
- **Purpose:** track monthly spend against category budgets so overspending is caught early, not at month-end.
- **Primary questions:** "Am I on track this month?" "Which category is closest to blowing its limit?"
- **Information shown:** overall monthly summary; per-category cards (spent/limit/remaining/%), trend vs. prior months.
- **Actions:** open a category; adjust a limit (→ Settings › Budgets); create/edit/merge/delete categories (→ Settings › Categories).
- **Related pages:** Category Detail, Transactions (filtered by category), Settings › Budgets, Settings › Categories, Insights (budget observations).

**Category Detail** (drill-down)
- **Purpose:** a deep dive into one category's spend for the month.
- **Primary questions:** "What exactly did I buy in this category?" "Is this trending up or down?"
- **Information shown:** spend-history chart, limit/remaining/%, every transaction in this category this month.
- **Actions:** edit the budget limit; view all transactions; rename/merge the category (→ Settings).
- **Related pages:** Transactions (filtered), Settings › Categories, Settings › Budgets.

### Rewards
- **Purpose:** track miles/points balances and transfer history across every Reward Programme, independent of which card earned them.
- **Primary questions:** "How many miles do I have, per programme?" "What did I earn this month?" "Where did these points come from or go to?"
- **Information shown:** every Reward Programme with current balance, this-month earning, last-updated; full transfer history log.
- **Actions:** manual balance correction; log a transfer between programmes; open Reward Programme Detail.
- **Related pages:** Reward Programme Detail, Wallet (the earning cards), Insights (reward opportunities), Settings › Reward Rules.

**Reward Programme Detail** (drill-down)
- **Purpose:** the full picture of one programme's balance and history.
- **Primary questions:** "How did I earn these points, transaction by transaction?" "What transfers happened, and at what ratio?"
- **Information shown:** balance, earning history (linked transactions/cards), full transfer log (date, ratio, resulting balances on both sides).
- **Actions:** manual balance override; log/edit a transfer.
- **Related pages:** Wallet (cards earning into this programme), Transactions (filtered).

### Insights
- **Purpose:** a proactive feed of AI-generated analysis explaining patterns and opportunities I wouldn't otherwise notice — distinct from Notifications (PRODUCT.md §5 vs §6.7).
- **Primary questions:** "What's changed in my spending that I should know about?" "Am I leaving miles or budget efficiency on the table?" "What subscriptions am I paying for?"
- **Information shown:** a chronological feed of Insight cards (type, title, "why it matters" narrative, related entity), generated on a schedule.
- **Actions:** open an insight for full detail; mark read/dismiss; jump to the related page; adjust which insight types generate (→ Settings › AI Settings).
- **Related pages:** Insight Detail, the entity an insight references (Accounts/Wallet/Budgets/Transactions), Settings › AI Settings.

**Insight Detail** (drill-down)
- **Purpose:** the full narrative and supporting evidence behind one insight.
- **Primary questions:** "Why is this actually true?" "What should I do about it?"
- **Information shown:** full narrative body, the underlying transactions/accounts/period it's based on.
- **Actions:** dismiss; jump to the related page.
- **Related pages:** the related Account/Wallet/Budgets/Transactions page.

### Settings
- **Purpose:** the single management surface for every configurable entity and system in the app (PRODUCT.md §6.6) — almost nothing here should ever need a code change.
- **Primary questions:** "Where do I add a new card?" "How do I change a reward rule?" "Is my Gmail connection healthy?"
- **Information shown:** a navigable list of sub-areas.
- **Actions:** full CRUD on every entity; reconnect Gmail; toggle notification/insight behaviour; view developer diagnostics.
- **Related pages:** every sub-area links back to the primary page it configures.

| Settings sub-page | Configures | Links back to |
|---|---|---|
| Banks | Institutions: add/edit/remove, sender patterns for email matching | Accounts, Wallet |
| Accounts | Add/edit/archive Asset accounts | Accounts |
| Credit Cards | Add/edit/archive Credit Cards | Wallet |
| Reward Rules | Per-card earning rates, bonus categories/caps | Wallet, Rewards |
| Categories | The customizable category list | Budgets, Transactions |
| Budgets | Per-category monthly limits | Budgets |
| Notifications | Which alert types are active, sensitivity | Notifications |
| Gmail Connection | Connect/reconnect/disconnect, sync health, manual sync | Home (sync status) |
| AI Settings | Which Insight types are enabled, generation cadence | Insights |
| Developer Tools | Raw extraction logs, re-run extraction, audit-log browsing, build info | Transaction Detail |

### Notifications / Activity Centre (global, not a primary-nav page)
- **Purpose:** a chronological list of every threshold-triggered alert needing attention.
- **Primary questions:** "What needs my attention right now?" "What did I miss?"
- **Information shown:** notifications (budget approaching/exceeded, bonus cap approaching/reached, better-card-available, import errors), each paired with a recommended action and reason; read/unread state.
- **Actions:** open the related page; mark read/dismiss.
- **Related pages:** Budgets, Wallet, Transactions (import errors).
- **Why it's not a primary-nav page:** it's an alert inbox, not a destination I'd browse for its own sake — it's reached the same way on every screen (a header icon with an unread badge), the same way Home teases at most one item from it. Making it a full nav tab would compete with Insights for the same mental slot ("things the app is telling me") when PRODUCT.md §6.7 explicitly requires the two to read as different kinds of things.

## 4. First Launch Experience

A linear, non-skippable-in-order wizard — there is nothing useful to show on Home until this graph exists (PRODUCT.md §3):

1. **Google Login** — OAuth sign-in, hard-restricted to the one allow-listed email. Establishes identity; nothing else is possible before this.
2. **Gmail Connection** — same consent flow requests `gmail.readonly`. The screen explains *why* (this is what makes zero-manual-entry ingestion possible) before asking for consent, and previews which Institutions' senders will be watched.
3. **Account Setup** — add each Institution in use, then create its Accounts (Assets) and Credit Cards (Liabilities); create each Reward Programme (standalone, or pre-linked to a card being set up).
4. **Starting Balances** — enter opening balance, currency, and expected balance sign for every Account and Credit Card just created, and a starting balance for every Reward Programme. This is the only point in the product where balances are typed in by hand (PRODUCT.md §3, §6.8) — after this, everything updates automatically.
5. **Budgets** — review the seeded default category list (editable now or later), optionally set a monthly limit per category. Entirely skippable with sensible defaults; budgets can be configured any time from Settings.
6. **Home** — onboarding is complete. Net Worth, Cash Available, and Credit Card Outstanding are already correct from step 4's opening balances, even though Recent Transactions, Recommended Card, and Miles Earned will be empty/sparse until the first Gmail sync runs.

## 5. Daily User Flow

The common case, almost always on mobile, almost always under 30 seconds:

1. Open the app → land on **Home**.
2. Glance at Net Worth, Cash Available, Credit Card Outstanding, Budget Status, Recommended Card, Miles Earned This Month.
3. Notice a new item in Recent Transactions → tap it → confirm the category is right (or correct it) on **Transaction Detail** → back to Home.
4. If the header notification badge is lit, open **Notifications**, act on or dismiss it.
5. If a new insight is teased, open it on **Insights** for the full "why it matters," then close.

That's the whole loop for a normal day — no need to visit Accounts, Wallet, Budgets, or Rewards directly.

A less frequent but important variant, **before making a purchase**: open **Wallet** (or use Home's Recommended Card) to decide which card to use for a specific merchant/category before paying.

A weekly/monthly variant: open **Budgets** to review the month's category status in full, open **Rewards** to check overall miles balances, and browse the full **Insights** feed rather than just the Home teaser.

## 6. Mobile Navigation

Mobile defaults to Home and prioritises quick checks (PRODUCT.md §6.2): budgets, recent transactions, credit card recommendations, bonus spend progress. Eight primary pages is too many for a bottom tab bar (a native-feeling app keeps that to 4–5 slots), so mobile nav is a **bottom tab bar for the highest-frequency pages, plus a "More" tab for the rest**:

- **Bottom tab bar:** Home · Transactions · Wallet · Budgets · More
- **More** (a simple list, not a hub page): Accounts, Rewards, Insights, Settings.
- **Notifications** are reached via a persistent bell icon in the header on every screen, not a tab — consistent with §3's reasoning for why it isn't a primary page at all.

Rewards and Insights sit behind "More" deliberately: they're weekly/monthly checks (§5), not daily ones, so they don't need to cost a permanent tab slot that Wallet or Budgets would otherwise use.

## 7. Desktop Navigation

Desktop prioritises detailed analysis and planning (PRODUCT.md §6.2), and has the room mobile doesn't, so there's no need to hide anything behind an overflow menu:

- **Persistent left sidebar**, all eight primary pages visible at once, always in the order from §1: Home, Accounts, Wallet, Transactions, Budgets, Rewards, Insights, Settings (Settings visually separated at the bottom of the sidebar, since it's configuration rather than daily use).
- **Persistent header:** the Notifications bell (with unread badge) and Gmail sync-health indicator, visible regardless of which primary page is open — the same "reachable from anywhere" treatment as on mobile.
- Drill-down pages (Account Detail, Credit Card Detail, Transaction Detail, Category Detail, Reward Programme Detail, Insight Detail) open within the same sidebar frame rather than replacing it, so navigating back to any primary page never costs more than one click.
