// Shared styling conventions for raw HTML form controls (this codebase
// uses native <input>/<select>, not a component library wrapper -- see
// DESIGN_SYSTEM_V2.md §11). Previously every form file declared its own
// identical `fieldClass` string; consolidated here so the softer resting
// border, larger padding, and focus ring stay consistent everywhere
// instead of drifting per-file. No width utility included -- callers add
// their own (w-full for form grids, a fixed width for compact editors).
export const fieldClass =
  "rounded-md border border-border/70 bg-background px-3 py-2 text-sm transition-colors duration-150 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
