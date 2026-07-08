# MilesOS — Design System

The final planning document before implementation. Companion to [EXPERIENCE.md](./EXPERIENCE.md) (how it should feel), [NAVIGATION.md](./NAVIGATION.md) (how it's organised), and [PRODUCT.md](./PRODUCT.md) (Principle 5: beautiful enough to enjoy opening every day). This defines a small, consistent visual language — enough for consistency, not a pursuit of perfection. Where this document is silent on something, prefer the simplest option consistent with §1 rather than inventing a new rule.

## 1. Design Principles

- **Simplicity over decoration.** Every element must earn its place. If it doesn't help me understand something or decide something, cut it.
- **Information before visuals.** The number or fact leads. Colour, icon, and chart support it — they never substitute for it.
- **Calm and uncluttered.** Generous whitespace, low visual noise. This is the visual expression of EXPERIENCE.md's "calm before urgency."
- **Every component supports a financial decision.** If a component doesn't help answer "what's my situation?" or "what should I do?", it doesn't belong in the library.

## 2. Typography

One type family, a small size/weight scale — kept deliberately shallow.

- **Heading hierarchy:** H1 (page title, one per page), H2 (section header), H3 (card/subsection title). Three levels, no deeper — if content needs a fourth level, it needs a different page structure instead.
- **Body text:** one weight/size for all descriptive and supporting copy, plus a single muted variant for secondary metadata (timestamps, labels, source badges).
- **Numeric displays:** a distinct, slightly larger style with tabular (fixed-width) numerals for standalone metrics — Home's stat tiles, budget percentages — so figures are instantly scannable and align cleanly.
- **Financial figures:** always right-aligned with tabular numerals so amounts line up in lists; currency symbol always present; negative (liability) values shown with a sign or parentheses — never colour alone, since colour reinforces meaning here but must never be the only carrier of it.

## 3. Spacing & Layout

- **Grid:** a single 8px base unit. Every margin, padding, and gap is a multiple of it — no arbitrary spacing values anywhere.
- **Page widths:** one comfortable max content width on desktop (not edge-to-edge); full width on mobile with one consistent side-padding value.
- **Card spacing:** one consistent gap value between cards in any grid or list, regardless of which card type.
- **Consistent padding:** three padding sizes total — compact, default, spacious — assigned by component type, never chosen ad hoc per instance.

## 4. Colour System

Kept small on purpose: colour communicates meaning, not decoration.

- **Primary** — one brand colour, used sparingly for primary actions, links, and focus states.
- **Success** — positive movement, on-track budgets, gains.
- **Warning** — approaching a limit or cap: needs attention soon, not urgently.
- **Error** — exceeded, broken, or failed states only. Kept rare so it stays meaningful (EXPERIENCE.md: red is earned, not default).
- **Neutral** — a grayscale ramp carrying most text, borders, and backgrounds.
- **Financial colours** — one consistent accent colour each for Assets, Liabilities, and Reward Programmes, used only to tag or group entities by type (a dot, a small accent, a badge) — never as a full card or page background. Liabilities are not automatically coloured as an error state: owing money on a credit card is normal, not a failure.

## 5. Component Library

Only the components MVP actually needs. Each has exactly one visual treatment — if a page seems to need a variant, it needs a different component, not a modified one.

| Component | Core content | Used on |
|---|---|---|
| **Metric Card** | One number, one label, optional trend indicator | Home |
| **Account Card** | Institution, name, balance, currency, last-synced | Accounts |
| **Credit Card Card** | Institution, name, balance owed, bonus-cap progress, cycle info | Wallet |
| **Budget Card** | Category, spent/limit/remaining, progress bar | Budgets |
| **Transaction Row** | Merchant, amount, category, account/card, source badge | Transactions, Home, detail pages |
| **Insight Card** | Type tag, title, one-line "why it matters" preview | Insights, Home teaser |
| **Recommendation Card** | Recommended card/action + its reason, one line | Wallet, Home |
| **Chart Container** | Title, optional legend, the chart itself | Anywhere a chart appears |
| **Section Header** | Title + optional single action ("See all") | Top of every list/grid section |
| **Status Badge** | Short label + colour for state | On-track/warning/exceeded, read/unread, imported/manual |

Status Badge is the only place state colour appears as a filled badge; everywhere else colour is an accent, not a fill.

## 6. Charts

A small, fixed set, reused everywhere rather than invented per page:

- **Trend line** — a single metric over time (net worth, category spend, miles balance).
- **Progress bar** — used vs. limit (budgets, bonus caps) — identical everywhere this question appears.
- **Simple bar** — category comparison (e.g., spend by category this month).

No pie/donut charts, no 3D, and never two chart types answering the same question on the same page — this is "explain, never overwhelm" applied to data visualisation.

## 7. Icons

- One icon set, used consistently everywhere — navigation, cards, badges.
- Icons label and reinforce (entity type, navigation); they never stand alone for a money amount or a decision.
- One stroke weight and size scale across every context — a single icon "voice," not several.

## 8. Motion

- **Purposeful only.** Every animation communicates a state change (a value updating, a new item arriving) — never motion for its own sake.
- **Subtle and short.** Quick, low-amplitude transitions. Nothing bouncy, nothing attention-grabbing — calm before urgency applies to motion too.
- **One easing/duration pair**, reused everywhere rather than tuned per component.
- **Never required.** Every piece of information must be understandable with animations off — motion is polish layered on top of a UI that already works without it.

## 9. Empty States

Every empty state (no transactions yet, no insights yet, no budgets set) states two things: what will appear here, and why it's empty right now ("waiting on your first Gmail sync," not a bare "No data"). It pairs with the one action that would fill it, where one exists (e.g., "Add a category"). No illustrations or mascots — a short sentence and, where relevant, a single button is enough. Tone follows EXPERIENCE.md: reassuring, never a dead end.

## 10. Loading States

Loading should feel like "almost there," never like uncertainty.

- **Skeletons mirror real content** (a Metric Card's skeleton looks like a Metric Card) so the page never jumps once data arrives — no generic spinners.
- **Last-known state stays visible** wherever possible instead of the page going blank (e.g., Home doesn't blank out during a background sync).
- **Nothing spins indefinitely.** Every loading state has a point past which it explains what's happening instead of continuing to imply "any second now" — the visual counterpart to EXPERIENCE.md's failure-mode transparency.

---

Planning is now complete. PRODUCT.md, ARCHITECTURE.md, ROADMAP.md, NAVIGATION.md, EXPERIENCE.md, and DESIGN_SYSTEM.md together define what to build, how, in what order, how it's organised, how it should feel, and how it should look. Implementation begins at Milestone 0 in [ROADMAP.md](./ROADMAP.md).
