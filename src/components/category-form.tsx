"use client";

import { useState } from "react";
import { createCategoryAction, updateCategoryAction } from "@/app/categories/actions";
import { Button } from "@/components/ui/button";
import type { CategoryInput } from "@/lib/categories";
import { fieldClass as baseFieldClass } from "@/lib/ui";
import { toast } from "@/lib/toast";
import { useEscapeKey } from "@/lib/keyboard-shortcuts";

const fieldClass = `${baseFieldClass} w-full`;

const DEFAULT_COLOR = "#6b7280";

export function CategoryForm({
  initial,
  onDone,
  onCancel,
}: {
  /** Present when editing an existing category; absent when creating. */
  initial?: CategoryInput & { id: string };
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [budget, setBudget] = useState(initial?.budget != null ? String(initial.budget) : "");
  const [currency, setCurrency] = useState(initial?.currency ?? "SGD");
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLOR);
  const [countsTowardsBudget, setCountsTowardsBudget] = useState(
    initial?.countsTowardsBudget ?? true,
  );
  const [countsTowardsSpent, setCountsTowardsSpent] = useState(
    initial?.countsTowardsSpent ?? true,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEscapeKey(onCancel);

  async function handleSubmit() {
    const input: CategoryInput = {
      name: name.trim(),
      budget: budget.trim() === "" ? null : Number(budget),
      currency: currency.trim(),
      color,
      countsTowardsBudget,
      countsTowardsSpent,
    };

    setSaving(true);
    setError(null);
    const result = initial
      ? await updateCategoryAction(initial.id, input)
      : await createCategoryAction(input);
    setSaving(false);

    if ("error" in result) {
      setError(result.error);
      toast.error("Couldn't save category", result.error);
      return;
    }
    toast.success(initial ? "Category updated" : "Category created");
    onDone();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Name
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dining"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Monthly budget (optional)
          <input
            className={fieldClass}
            type="number"
            step="0.01"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Currency
          <input
            className={fieldClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={3}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Color
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-8 w-10 shrink-0 rounded-md border border-border/70 bg-background outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <span className="text-sm tabular-nums text-muted-foreground">{color}</span>
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={countsTowardsSpent}
            onChange={(e) => setCountsTowardsSpent(e.target.checked)}
          />
          Counts towards Spent This Month
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={countsTowardsBudget}
            onChange={(e) => setCountsTowardsBudget(e.target.checked)}
          />
          Counts towards Budget cards
        </label>
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}

      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Add category"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
