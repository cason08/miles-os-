# MilesOS — Visual Direction

This is the concrete, permanent visual language of MilesOS — the operating system's visual identity. It translates [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)'s principles into actual tokens (colours, type scale, spacing, component code) so that every page built after Home looks like it belongs to the same product, without re-deriving the same decisions. Companion documents: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (the principles this operationalises), [EXPERIENCE.md](./EXPERIENCE.md) (the feeling this is trying to produce), [PRODUCT.md](./PRODUCT.md) §4 (what Home must show), [NAVIGATION.md](./NAVIGATION.md) (where every page and link leads).

This document is a living record of the *implemented* system, not a proposal — when a token here changes, the code changes with it, and vice versa. Treat a divergence between this file and `globals.css` as a bug in one of the two.

## 1. Foundation: Dark-Mode-First, Monochrome + One Accent

MilesOS is designed dark-first. The product EXPERIENCE.md asks for — "quietly in control," a "trusted advisor's morning briefing," calm before urgency — reads better on a near-black canvas than a bright white one: it feels like a cockpit instrument panel you glance at, not a form you fill in. Light-mode tokens remain fully defined (§2) so the product isn't locked out of a future toggle, but every design decision below is made for the dark canvas first and checked against light second.

The palette is deliberately ~90% grayscale. Colour is spent on exactly two jobs, per DESIGN_SYSTEM.md §4:
1. **State** — success / warning / error, always earned, never decorative.
2. **Entity type** — Assets / Liabilities / Reward Programmes, as a small accent (dot, badge, left-border), never a fill.

Everything else — cards, text, borders, chrome — is neutral. If a screen looks colourful, something has gone wrong.

## 2. Colour Tokens

All colours are defined in `oklch()` in `src/app/globals.css`, `:root` (light) and `.dark` (dark, the default — see §1 and §8). Perceptual lightness/chroma stay consistent across roles so the palette reads as one family rather than assorted hues.

| Token | Role | Dark value | Light value |
|---|---|---|---|
| `--background` | Page canvas | `oklch(0.14 0.004 260)` | `oklch(1 0 0)` |
| `--card` | Elevated surface | `oklch(0.18 0.004 260)` | `oklch(1 0 0)` |
| `--foreground` | Primary text | `oklch(0.96 0 0)` | `oklch(0.145 0 0)` |
| `--muted-foreground` | Secondary/metadata text | `oklch(0.66 0.006 260)` | `oklch(0.556 0 0)` |
| `--border` | Hairline dividers, card edges | `oklch(1 0 0 / 8%)` | `oklch(0.922 0 0)` |
| `--primary` | Primary actions, links, focus | `oklch(0.65 0.19 264)` | `oklch(0.50 0.19 264)` |
| `--success` | Positive movement, on-track | `oklch(0.72 0.15 152)` | `oklch(0.60 0.14 152)` |
| `--warning` | Approaching a limit | `oklch(0.80 0.15 85)` | `oklch(0.65 0.15 70)` |
| `--destructive` | Exceeded / broken / failed | `oklch(0.70 0.19 22)` | `oklch(0.577 0.245 27)` |
| `--assets` | Asset accounts tag | `oklch(0.75 0.11 195)` | `oklch(0.55 0.11 195)` |
| `--liabilities` | Credit card / liability tag | `oklch(0.72 0.03 250)` | `oklch(0.50 0.04 250)` |
| `--rewards` | Reward programme tag | `oklch(0.72 0.16 305)` | `oklch(0.55 0.16 305)` |

Notes:
- **Primary** is an indigo-blue, used sparingly (primary buttons, links, focus rings, the one "hero" number's emphasis). It is never used to mean "good" — that's Success's job.
- **Liabilities is deliberately low-chroma** (near-neutral steel, not red or orange). DESIGN_SYSTEM.md §4 is explicit: owing money on a credit card is normal, not a failure. Colour must not accidentally imply otherwise.
- **Assets (teal) and Rewards (violet)** sit far apart on the hue wheel from both Liabilities and each other so the three entity tags are distinguishable at a glance in a legend or a row of badges.
- **Status Badge is the only place state colour is a filled background** (DESIGN_SYSTEM.md §5); everywhere else — including the Assets/Liabilities/Rewards tags — colour is an accent (a dot, a thin left border, a tinted icon), never a full card or page background.
- Negative/liability amounts are never signalled by colour alone — always paired with a minus sign or parentheses (DESIGN_SYSTEM.md §2).

## 3. Typography

One family, two weights of use, kept shallow per DESIGN_SYSTEM.md §2. Geist Sans (`--font-geist-sans`, loaded via `next/font/google` in `layout.tsx`) for everything; Geist Mono only where raw/technical strings appear (IDs, not built yet).

| Style | Classes | Use |
|---|---|---|
| H1 | `text-2xl font-semibold tracking-tight` | One per page — the page's title/greeting |
| H2 | `text-lg font-semibold` | Section header (e.g. "Budgets", "Transactions") |
| H3 | `text-sm font-medium` | Card/subsection title |
| Body | `text-sm text-foreground` | Descriptive/supporting copy |
| Muted | `text-sm text-muted-foreground` | Timestamps, labels, source badges |
| Metric | `text-3xl font-semibold tabular-nums` | Standalone stat (Cash Available, Miles Earned) |
| Metric — hero | `text-4xl sm:text-5xl font-semibold tabular-nums` | The single most important number on a page (Home's Net Worth) |

Financial figures are always `tabular-nums`, right-aligned in any list context, and always carry a currency symbol (`S$`) — never a bare number. This is enforced in `MetricCard` and `TransactionRow` (§7) rather than left to call sites to remember.

## 4. Spacing & Layout

Single 8px base grid, per DESIGN_SYSTEM.md §3. Tailwind's spacing scale is 4px per step, so **only even-numbered spacing utilities are used** (`gap-4`, `p-6`, `gap-8` — never `p-3`, `gap-5`, `p-7`). Three padding sizes, assigned by component type, never chosen ad hoc:

| Size | Value | Used by |
|---|---|---|
| Compact | `p-4` (16px) | Transaction rows, badges, list items |
| Default | `p-6` (24px) | Cards (Metric, Recommendation, Insight, Budget) |
| Spacious | `p-8` (32px) | Page-level hero sections |

- **Page width:** `max-w-6xl` centred on desktop; full width with `px-6` side padding on mobile.
- **Card gap:** `gap-6` everywhere cards sit in a grid or list, regardless of card type.

## 5. Elevation & Surfaces

- **Radius:** `--radius: 0.875rem` (14px) at the base — softer and more "premium OS" than shadcn's 10px default. `--radius-sm/md/lg/xl` etc. derive proportionally (see `globals.css` `@theme inline`); buttons/inputs use the smaller derived steps, cards use `--radius-xl`.
- **Cards:** `bg-card` + `border border-border` (a hairline, not a heavy outline) + `rounded-xl`. No drop shadows in dark mode — shadows read as murk on a near-black background; elevation comes from the background stepping up one lightness stop (`--card` vs `--background`) plus the hairline border. Light mode may add a very soft `shadow-sm` since shadows read correctly on white.
- **No nested card-on-card** — one level of surface elevation per screen region.

## 6. Icons

`lucide-react` (already installed, matches `components.json`'s `iconLibrary: "lucide"`). One stroke width (`strokeWidth={1.75}`, slightly lighter than Lucide's 2px default for a more refined line), one size scale: `size-4` (16px) inline with text, `size-5` (20px) in cards/rows, `size-6` (24px) for standalone emphasis. Icons always label or reinforce something that also has a text label — never the sole carrier of meaning for a money amount or a decision (DESIGN_SYSTEM.md §7).

## 7. Component Inventory

Maps DESIGN_SYSTEM.md §5's component table to actual files under `src/components/ui/`. Every future page reuses these rather than inventing new treatments.

| Component | File | Notes |
|---|---|---|
| Card (base surface) | `card.tsx` | Underlies every other component below |
| Metric Card | `metric-card.tsx` | One number, one label, optional trend, optional `accent` (assets/liabilities/rewards/primary) |
| Section Header | `section-header.tsx` | Title + optional "See all →" action |
| Status Badge | `status-badge.tsx` | Filled-background badge; the only place colour fills a shape |
| Progress Bar | `progress-bar.tsx` | Used-vs-limit; shared by budgets and (later) bonus-cap usage |
| Transaction Row | `transaction-row.tsx` | Merchant, category, account/card, source badge, right-aligned tabular amount |
| Recommendation Card | `recommendation-card.tsx` | One recommended action + one-line reason, primary-accented |
| Insight Card | `insight-card.tsx` | Type tag + title + one-line "why it matters" preview |
| Budget Card | `budget-card.tsx` | Category, spent/limit, status badge, progress bar |

Not yet built (no page needs them yet): Account Card, Credit Card Card, Chart Container / Trend line / Simple bar. Build these when Accounts, Wallet, and Budgets are implemented (ROADMAP.md M9+) — reuse the tokens in this document rather than re-deriving the palette.

## 8. Motion

One easing/duration pair, reused everywhere: `transition-all duration-200 ease-out`. Used for hover states (border/background shifts), focus rings, and progress bar fills. Nothing bounces, nothing exceeds 200ms, and every state is fully legible with motion disabled (DESIGN_SYSTEM.md §8).

## 9. Default Theme

`<html>` renders with the `dark` class applied unconditionally (`src/app/layout.tsx`) — there is no theme toggle yet, and none is required by any planning document. Light-mode tokens stay correct and maintained (§2) so a toggle can be added later without a redesign.

## 10. Applying This to Home

Home (`src/app/page.tsx`) is the first and, as of this writing, only page built against this system — it exists to prove the system, not just to ship a page. It uses **placeholder data only** (clearly fabricated Singapore-context figures — SGD amounts, DBS/UOB/OCBC/Citibank institutions, KrisFlyer/DBS Points/HeyMax programmes per PRODUCT.md §6.5) so the visual language can be evaluated against realistic content shapes before any ingestion/budgeting/rewards module exists to supply real numbers. Every field PRODUCT.md §4 requires on Home is represented: Net Worth (hero Metric Card), Cash Available and Credit Card Outstanding (Metric Cards, tagged Assets/Liabilities), Budget Status (overall bar + categories closest to their limits), Recent Transactions, Recommended Card, and Miles Earned This Month — plus one teased Insight, per NAVIGATION.md §3's "Home teases, at most one."

The page's authentication/session/Gmail-connection logic (the redirect guard and the connected/not-connected banner) is unchanged from the prior implementation — this document and the Home redesign are visual-only and do not alter any business logic.
