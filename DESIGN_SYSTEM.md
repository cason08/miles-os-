# MilesOS — Design System

Companion to [EXPERIENCE.md](./EXPERIENCE.md) (how it should feel), [NAVIGATION.md](./NAVIGATION.md) (how it's organised), and [PRODUCT.md](./PRODUCT.md) (Principle 5: beautiful enough to enjoy opening every day). This defines a small, consistent visual language — enough for consistency, not a pursuit of perfection. Where this document is silent on something, prefer the simplest option consistent with §1 rather than inventing a new rule.

This governs every real product screen going forward. It does not apply to internal developer/debug tooling (anything under `/debug/*`), which stays deliberately plain and utilitarian — that's a diagnostic surface, not a product experience.

## 0. The Feeling

MilesOS should feel like it was designed by Apple, Linear, Copilot Money, Raycast, and Vercel — not like a crypto dashboard, a generic SaaS admin panel, a gaming UI, or an AI startup landing page.

**MilesOS should feel expensive — not because it has effects, but because it shows restraint.** Information always outranks decoration. Typography creates hierarchy, not colour. Whitespace creates luxury. Colour communicates meaning and nothing else. Every visual element must earn its place. Whenever a design decision is unclear, choose the simpler option. Ask, for every screen: *does this make MilesOS feel calmer, more premium, and easier to understand?* If not, simplify it until it does.

The interface should feel like an operating system, not a dashboard.

## 1. Design Principles

- **Simplicity over decoration.** Every element must earn its place. If it doesn't help me understand something or decide something, cut it.
- **Information before visuals.** The number or fact leads. Colour, icon, and chart support it — they never substitute for it.
- **Calm and uncluttered.** Generous whitespace, low visual noise. This is the visual expression of EXPERIENCE.md's "calm before urgency."
- **Every component supports a financial decision.** If a component doesn't help answer "what's my situation?" or "what should I do?", it doesn't belong in the library.

## 2. Dark Mode & Background

Dark mode first — it is the default, not an alternative theme bolted on later.

- **Avoid pure black.** Use deep blue-grey tones for the base background.
- **Subtle radial gradients**, not a flat fill — the background should feel cinematic, like it has depth, not like a solid rectangle.
- **An extremely light grain texture** over the background adds physicality without reading as decoration.
- Backgrounds are felt, not noticed. If someone consciously registers the gradient or grain, it's too strong — pull it back.

## 3. Colour System

Approximately **95% monochrome.** One restrained accent colour system carries everything else. Never build a rainbow dashboard, and never colour a card simply to make the UI look more exciting — colour exists only to communicate meaning.

- **Primary/accent** — a single accent colour, used sparingly for primary actions, links, and focus states. This is the only colour that should draw the eye on an otherwise-monochrome screen.
- **Success** — positive movement, on-track budgets, gains.
- **Warning** — approaching a limit or cap: needs attention soon, not urgently.
- **Error** — exceeded, broken, or failed states only. Kept rare so it stays meaningful (EXPERIENCE.md: red is earned, not default).
- **Neutral** — a deep blue-grey ramp (§2) carrying nearly everything: text, borders, surfaces, backgrounds.
- **Financial colours** — one consistent accent each for Assets, Liabilities, and Reward Programmes, used only to tag/group entities by type (a dot, a small accent, a badge) — never as a full card or page background. Liabilities are not automatically coloured as an error state: owing money on a credit card is normal, not a failure.

## 4. Typography

**Geist** is the primary typeface (Inter is an acceptable fallback if needed). Typography carries hierarchy — not colour, not boxes, not decoration.

- **Heading hierarchy:** H1 (page title, one per page), H2 (section header), H3 (card/subsection title). Three levels, no deeper — if content needs a fourth level, it needs a different page structure instead.
- **Body text:** one weight/size for all descriptive and supporting copy, plus a single muted variant for secondary metadata (timestamps, labels, source badges). Minimal bold text — reserve weight for the numbers, not the prose.
- **Numbers are the hero of the application.** Financial figures get the largest, most prominent treatment on any screen — bigger and more visually dominant than their labels, which stay secondary and quiet. Emphasis comes from size and weight, not colour.
- **Financial figures:** tabular (fixed-width) numerals, always right-aligned in lists so amounts line up cleanly; currency symbol always present; negative (liability) values shown with a sign or parentheses — never colour alone.
- **Comfortable line heights, generous spacing.** Nothing should feel cramped. When in doubt, add space rather than shrink text.

## 5. Spacing & Layout

- **Grid:** a single 8px base unit. Every margin, padding, and gap is a multiple of it — no arbitrary spacing values anywhere.
- **Large negative space.** Whitespace is not empty space to be filled — it's what makes the interface feel premium rather than crowded.
- **Page widths:** one comfortable max content width on desktop (not edge-to-edge); full width on mobile with one consistent side-padding value.
- **Consistent rhythm.** The same spacing scale, applied the same way, on every screen — consistency is what reads as "engineered," not "decorated."

## 6. Cards & Surfaces

Cards should feel premium and tactile — engineered, not decorated. Avoid obvious glassmorphism (heavy blur, obvious frosted panels).

- **Soft elevated surfaces** rather than boxed containers — a card should read as slightly raised off the background, not boxed in by it.
- **Extremely subtle transparency and almost imperceptible gradients** — enough to add depth, never enough to be the point of the design.
- **Thin hairline borders (1px)**, preferred over shadows for defining edges. Borders should almost disappear into the background, not draw a hard line around content.
- **Minimal shadow.** Depth comes from subtle surface treatment and hairline borders first; shadow is a last resort, used lightly.

## 7. Component Library

Only the components MVP actually needs. Each has exactly one visual treatment — if a page seems to need a variant, it needs a different component, not a modified one. All follow §6 for surface treatment.

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

## 8. Charts

A small, fixed set, reused everywhere rather than invented per page. Thin strokes, minimal gridlines, subtle gradients — charts support the data, they never dominate the page.

- **Trend line** — a single metric over time (net worth, category spend, miles balance).
- **Progress bar** — used vs. limit (budgets, bonus caps) — identical everywhere this question appears.
- **Simple bar** — category comparison (e.g., spend by category this month).

No pie/donut charts, no 3D, and never two chart types answering the same question on the same page — this is "explain, never overwhelm" applied to data visualisation.

## 9. Icons

**Lucide icons only.**

- One icon set, used consistently everywhere — navigation, cards, badges.
- Consistent stroke weight across every context — a single icon "voice," not several.
- No colourful icons, no decorative icons. Icons label and reinforce (entity type, navigation); they never stand alone for a money amount or a decision, and never carry meaning colour alone should carry.

## 10. Motion

Motion should feel like Apple: very subtle, no bounce, no dramatic scaling.

- **Purposeful only.** Every animation communicates a state change (a value updating, a new item arriving) — never used to draw attention to itself.
- **Short fades and gentle movement only.** Quick, low-amplitude transitions.
- **One easing/duration pair**, reused everywhere rather than tuned per component.
- **Never required.** Every piece of information must be understandable with animations off — motion is polish layered on top of a UI that already works without it.

## 11. Empty States

Every empty state (no transactions yet, no insights yet, no budgets set) states two things: what will appear here, and why it's empty right now ("waiting on your first Gmail sync," not a bare "No data"). It pairs with the one action that would fill it, where one exists (e.g., "Add a category"). No illustrations or mascots — a short sentence and, where relevant, a single button is enough. Tone follows EXPERIENCE.md: reassuring, never a dead end.

## 12. Loading States

Loading should feel like "almost there," never like uncertainty.

- **Skeletons mirror real content** (a Metric Card's skeleton looks like a Metric Card) so the page never jumps once data arrives — no generic spinners.
- **Last-known state stays visible** wherever possible instead of the page going blank (e.g., Home doesn't blank out during a background sync).
- **Nothing spins indefinitely.** Every loading state has a point past which it explains what's happening instead of continuing to imply "any second now" — the visual counterpart to EXPERIENCE.md's failure-mode transparency.

---

This is the permanent visual language for MilesOS unless explicitly overridden. Do not imitate another product's layout — capture this philosophy instead, so that every screen, however different its content, still feels like it belongs to the same product.
