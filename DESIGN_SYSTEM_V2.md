# MilesOS — Design System v2

This supersedes [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) and [VISUAL_DIRECTION.md](./VISUAL_DIRECTION.md) as the project's design source of truth. It doesn't reverse either document's philosophy — dark-first, ~95% monochrome plus one accent, numbers as the hero, restraint over decoration — it graduates the "Future Visual Evolution" notes both files already called out (subtle gradients, more depth, softer elevation) from aspiration into the current spec, and adds the topics this milestone needs that weren't covered yet (glass usage, toasts, motion durations, accessibility detail). Where this document is silent, those two remain the fallback. As with v1: a divergence between this file and the actual code is a bug in one of the two.

**The reference points for this pass**: Linear, Raycast, Arc, Apple Wallet, Vercel's dashboard. **Explicitly not**: heavy glassmorphism, overly transparent cards, flashy animation, a showcase/marketing site. Financial data is always the primary focus — every rule below exists to support that, not to compete with it.

## 1. Surface Hierarchy

Three levels, never more on one screen:

| Level | Token | Use |
|---|---|---|
| 0 — Canvas | `bg-background` | The page itself |
| 1 — Surface | `bg-card` | Cards, rows, panels — the normal resting surface |
| 2 — Overlay | `bg-popover` | Toasts, dropdown menus, anything that floats above layout |

No level-3. A card never contains a nested card — a section inside a card is a `divide-y` list or a subtle inset (see §2), never another bordered box.

## 2. Elevation

Elevation communicates two things and nothing else: **resting depth** (a surface sits above the canvas) and **interactive lift** (something responds to your cursor). It is not decoration.

- **Resting elevation** (every card, all the time): one lightness step (`bg-card` vs `bg-background`) + a hairline border (`border-border`) + the new soft shadow (§4). This combination is what "layered surface" means here — not a visible drop shadow doing the work alone.
- **Hover elevation** (interactive cards/rows only — not static display cards): shadow deepens one step and the surface lifts `-1px` (`hover:-translate-y-px`). Reserved for things you can act on (a row you can click into, a card wrapping an editable control) — never applied to a purely informational card just for flourish.
- **Active/pressed**: drops back down (`translate-y-px`), shadow returns to resting. This is already the convention in `button.tsx` (`active:translate-y-px`) — extended to any other clickable surface that gained hover elevation.

## 3. Border Radius Scale

Unchanged base token (`--radius: 0.875rem`), derived scale unchanged in `globals.css`. Assignment convention, made explicit here since it wasn't written down before:

| Token | ~px | Used by |
|---|---|---|
| `--radius-sm` | 8px | Checkboxes, small inline chips |
| `--radius-md` | 11px | Inputs, selects, small buttons |
| `--radius-lg` (`--radius`) | 14px | Default buttons, badges |
| `--radius-xl` | 20px | Cards, panels, toasts |
| `--radius-2xl`+ | 25px+ | Reserved, not used yet — don't reach for it without a reason |

Never mix two radius steps on sibling elements at the same visual level (e.g. a card at `xl` containing a button also at `xl` — the button should read as smaller/rounder than its container, not match it).

## 4. Shadow System

Dark mode previously used *no* shadow at all ("shadows read as murk on near-black"). That's still half-true — a shadow that's just `black/20` on a near-black background is invisible or muddy. The fix isn't skipping shadows, it's making them correctly: **a soft, low-opacity dark shadow for depth, plus a hairline top highlight for the "lit from above" read that makes a raised surface actually look raised on a dark canvas.**

```css
--shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.20);
--shadow-md: 0 4px 12px -2px oklch(0 0 0 / 0.28), 0 1px 0 0 oklch(1 0 0 / 0.04) inset;
--shadow-lg: 0 12px 28px -6px oklch(0 0 0 / 0.32), 0 1px 0 0 oklch(1 0 0 / 0.06) inset;
```

| Token | Use |
|---|---|
| `shadow-sm` | Resting cards, rows |
| `shadow-md` | Hovered/lifted cards, open dropdown/menu content, toasts |
| `shadow-lg` | Reserved for anything that overlays the whole page (none yet — no modals exist) |

Never stack more than one shadow step on one element. Never use a shadow to fake a border — the hairline border stays, always; the shadow only adds depth behind it.

## 5. Glass Usage Guidelines

"Glass" here means exactly one thing: **a very subtle translucency + backdrop blur on a small number of fixed, floating, always-above-content surfaces** — not a texture applied to cards in general.

**Allowed:**
- The sticky top header bar (already `bg-background/95 backdrop-blur` — keep, it's the one place this earns its place, since content scrolls underneath it).
- Toasts.
- Open dropdown/menu content.

**Not allowed:**
- Any resting card (Metric Card, Budget Card, Transaction Row, etc.) — these stay opaque (`bg-card`, no blur, no transparency). A financial figure sitting on a semi-transparent panel is exactly the "showcase website" look this milestone explicitly rejects.
- Buttons get a *hint* of the same language (§9) but never actual `backdrop-blur` — a button is small enough that blur reads as murky, not glassy.

If you're ever unsure whether something should be "glass," default to no.

## 6. Gradient Guidelines

Gradients are a **finishing touch on top of a flat surface**, never the surface's whole identity, and never colourful. Two allowed uses:

1. **Card surface gradient** — an almost-imperceptible linear gradient from `--card` to a hair lighter/darker version of itself (`color-mix(in oklch, var(--card), white 3%)` at the top, fading to plain `--card`), top-to-bottom. This is what "layered surface" looks like up close: a card that reads as very subtly lit from above, not flat-filled. If you can consciously see the gradient, it's too strong — pull it back to 2–3%.
2. **Primary button gradient** — a similarly subtle gradient on the default/primary button variant only (§9), reinforcing it as the one call-to-action colour on an otherwise monochrome screen.

Never: a multi-hue gradient, a gradient used to fill a whole page background, or a gradient on a data value (chart fills stay flat per DESIGN_SYSTEM.md §6).

## 7. Spacing System

Unchanged from v1 (VISUAL_DIRECTION.md §4) — 8px grid, only even Tailwind spacing steps, three padding sizes (`p-4` compact / `p-6` default / `p-8` spacious) assigned by component type. This milestone's "better spacing" goal means *applying this more consistently*, not introducing a new scale — if you find a `p-3` or `gap-5` anywhere while doing this work, that's a bug to fix, not a precedent to extend.

One addition: **card internal rhythm**. Within a card, stacked elements (label → value → supporting row) use `gap-2` for tightly related pairs (a label directly above its value) and `gap-4`/`gap-6` between distinct sub-sections — this wasn't written down before and led to ad hoc choices; this is now the rule.

## 8. Typography Hierarchy

Unchanged hierarchy from VISUAL_DIRECTION.md §3 (H1/H2/H3, Body, Muted, Metric, Metric-hero). This pass adds weight to the rule that was already implicit: **a Metric Card's number is always the single largest, heaviest element in its card** — nothing else in that card (label, trend, badge) may match or exceed its size or weight. Where a card currently under-differentiates label vs. value (same-ish visual weight), bump the value, don't shrink the label — hierarchy comes from making the important thing bigger, never from making everything else smaller than legible.

## 9. Icon Sizing

Unchanged from VISUAL_DIRECTION.md §6: `lucide-react` only, `strokeWidth={1.75}`, three sizes — `size-4` inline with text, `size-5` in cards/rows, `size-6` for standalone emphasis. No change needed; restated here because it's load-bearing for the buttons/badges work in this milestone.

## 10. Button Variants

Existing `cva` variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) keep their names and jobs. This pass changes their *finish*, not their taxonomy:

- **`default` (primary)** — gets the subtle gradient from §6, plus a soft shadow (`shadow-sm`, deepening to a hair more on hover). This is the one button on screen allowed a gradient — it's the primary action, it should read as slightly more "alive" than everything else.
- **`outline` / `secondary`** — get the faintest hint of the glass language (§5): a 1–2% lighter background mix and the same hairline border, no blur. Enough to feel less flat than a plain fill, not enough to read as translucent.
- **`ghost` / `link`** — unchanged (no surface at all until hovered — that's their job).
- **`destructive`** — unchanged tone (low-opacity red fill, not a solid red button — DESIGN_SYSTEM.md §2's "red is earned" applies to buttons too).
- **All variants**: hover gets a `-1px` lift matching §2's hover-elevation rule (previously only background-color changed on hover); active/pressed already returns to baseline via the existing `active:translate-y-px`.
- **Sizing**: unchanged scale (`xs/sm/default/lg` + icon variants) — "consistent sizing" in this milestone means auditing call sites that picked an ad hoc size, not adding new ones.

## 11. Input Styling

Every form in the app currently repeats its own `fieldClass` string. This pass extracts one shared convention (a `src/lib/ui.ts` `inputClass`/`selectClass` constant, or a thin `Input`/`Select` wrapper if repetition justifies it) instead of five copies drifting apart. New treatment:

- Border softens from the current flat `border-border` to a slightly lower-contrast tone at rest, strengthening only on focus (see §13) — the goal is that an empty form doesn't look like a table of boxes.
- Padding increases slightly (`px-3 py-2` instead of `px-2 py-1.5`) for a less cramped touch target, satisfying both "better padding" and the accessibility click-target goal (§19) in one change.
- Radius: `--radius-md` (§3), consistent with buttons of the same visual weight.
- Background stays flat `bg-background` (no gradient/glass on inputs — glass is reserved per §5 for floating surfaces, and an input is a data-entry surface, not a floating one).

## 12. Hover States

One rule, applied everywhere instead of ad hoc per component: **hover changes exactly one of {background tint, border tint, elevation} — never more than one dimension at once**, and never a colour hue change (only lightness/opacity shifts within the existing token). Interactive rows (Transaction Row when editable, Category/Commitment rows) get a faint `hover:bg-muted/40` wash they didn't have before, matching how `Button`'s `ghost` variant already behaves — this is what makes a list feel clickable before you've clicked anything.

## 13. Focus States

Unchanged mechanism (`focus-visible:ring-3 focus-visible:ring-ring/50`, already in `button.tsx`), extended to every interactive element that doesn't yet have it: raw `<input>`/`<select>` elements in forms, the category-colour swatch input, row action buttons. Rule: **focus is always visible via a ring, never via a border-colour-only change** (a colour-only change fails at a glance for anyone scanning quickly, and fails contrast-checking tools). `focus-visible`, not `focus` — so clicking with a mouse doesn't leave a persistent ring, only keyboard navigation does.

## 14. Motion Guidelines

Unchanged philosophy (VISUAL_DIRECTION.md §8): purposeful only, short, one easing curve, never required to understand the UI. This pass adds a **second** duration step (§15) because one duration doesn't fit both a hover micro-interaction and a row leaving the list, and formalizes **respecting `prefers-reduced-motion`**: every transition/animation added in this milestone is wrapped so it collapses to an instant (or near-instant, opacity-only) change when the user's OS requests reduced motion — this was implicit before, it's now a hard rule with a shared `motion-safe:`/`motion-reduce:` pattern (or the equivalent `@media (prefers-reduced-motion: reduce)` block in `globals.css`) rather than left to each component to remember.

## 15. Animation Durations

Two steps, not one — reused everywhere, never tuned per component:

| Token | Duration | Use |
|---|---|---|
| `duration-150` (micro) | 150ms | Hover/focus state changes, button press |
| `duration-300` (base) | 300ms | Row collapse/removal, dropdown open/close, cross-fade (Privacy Mode), progress bar fill |

Nothing in this app should animate longer than 300ms. `ease-out` throughout (unchanged).

## 16. Loading Behaviour

DESIGN_SYSTEM.md §12 already specifies "skeletons mirror real content, no generic spinners" — this pass actually builds it. Because most of this app's data loads server-side (Server Components, no client-side fetch waterfalls), the applicable surface for a skeleton is narrower than a typical SPA: it applies to (a) the brief window between a Server Action firing and its `revalidatePath` resolving, for actions that visibly replace content (not ones that just show a result line), and (b) any future client-side-fetched section. Where an action's only visible effect is a short inline result message (Sync, Save), a toast (§18) is the right feedback, not a skeleton — don't build a skeleton for something that never had a content shape to mirror.

## 17. Empty States

Unchanged from DESIGN_SYSTEM.md §11 — say what will appear and why it's empty now, pair with the one action that fills it, no illustrations. Restated because "polish" work has a habit of adding decoration to empty states first; that's explicitly against the brief here.

## 18. Toast Behaviour

New surface for this milestone, built on `@base-ui/react/toast` (already a dependency — no new library).

- **One toast region**, bottom-right on desktop, bottom-center on mobile (thumb-reachable, doesn't cover the header).
- **Four kinds**, visually distinguished by a left accent stripe + icon only (never a full-colour background — consistent with "Status Badge is the only filled-colour surface" from DESIGN_SYSTEM.md §5): success (default action confirmations — "Category saved"), error (a failed action, always includes the actual error message, never a bare "Something went wrong"), info (Sync completed, with the same Imported/Ignored/Failed summary already shown inline today), and the delete-undo toast (§ Undo, a special case with an action button, not just a dismiss).
- **Auto-dismiss**: success/info after 4s, error after 6s (longer, since it's more likely to need reading), undo after exactly 5s (a hard product requirement, not just a default).
- **Stacking**: max 3 visible at once, oldest pushed out — this app doesn't fire toasts fast enough to need more, and stacking 5+ toasts is itself visual clutter.
- **Motion**: enters with a short slide + fade (`duration-300`), exits with fade only (faster, `duration-150`) — leaving should never feel slower than arriving.

## 19. Accessibility Considerations

- **Focus rings**: §13, non-negotiable on every interactive element, keyboard-only (`focus-visible`).
- **Keyboard navigation**: every action reachable by mouse must be reachable by keyboard — this was already mostly true (native `<button>`/`<select>`/`<input>` everywhere, no custom click-div patterns) and this milestone's shortcuts (A / `/` / Esc) add a second, faster path on top, never the only path.
- **Click targets**: minimum 32px (`size-8`/`h-8`) for any standalone icon button — several icon-only controls (the refresh icon, the privacy toggle) are currently smaller than this and get bumped up as part of the input/button pass, without changing their visual weight (padding absorbs the difference, not a bigger icon).
- **Contrast**: `muted-foreground` on `card`/`background` must stay ≥ 4.5:1 (already true per the existing oklch tokens — re-verified, not re-derived, when any token value changes in this milestone).
- **`prefers-reduced-motion`**: §14 — every new animation degrades gracefully, nothing here is load-bearing for comprehension without motion.
- **Toasts**: use `role="status"` (success/info) or `role="alert"` (error) via Base UI's toast primitives so screen readers announce them without the user needing to find them visually.

---

This document, like v1, is a living record of the *implemented* system. When a value here changes in code, this file changes with it in the same commit.
