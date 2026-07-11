"use client";

import { useState } from "react";
import { archiveCategoryAction, deleteCategoryAction } from "@/app/categories/actions";
import { Button } from "@/components/ui/button";
import type { CategoryData } from "@/lib/categories";
import { toast } from "@/lib/toast";

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === "SGD" ? "S$" : `${currency} `;
  const value = amount.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${value}`;
}

function exclusionLabel(category: CategoryData): string | null {
  if (!category.countsTowardsSpent && !category.countsTowardsBudget) {
    return "Excluded from Spent This Month & Budget";
  }
  if (!category.countsTowardsSpent) return "Excluded from Spent This Month";
  if (!category.countsTowardsBudget) return "Excluded from Budget";
  return null;
}

export function CategoryRow({
  category,
  onEdit,
}: {
  category: CategoryData;
  onEdit: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleArchive() {
    setBusy(true);
    setError(null);
    const result = await archiveCategoryAction(category.id);
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      toast.error("Couldn't archive category", result.error);
      return;
    }
    toast.success("Category archived");
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const result = await deleteCategoryAction(category.id);
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      toast.error("Couldn't delete category", result.error);
      return;
    }
    toast.success("Category deleted");
    setConfirmingDelete(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: category.color ?? "#6b7280" }}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{category.name}</span>
          {exclusionLabel(category) && (
            <span className="truncate text-xs text-muted-foreground">{exclusionLabel(category)}</span>
          )}
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-right text-sm font-medium tabular-nums">
          {category.budget != null
            ? `${formatCurrency(category.budget, category.currency)} / mo`
            : "No budget set"}
        </span>

        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Delete?</span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? "Deleting..." : "Yes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleArchive} disabled={busy}>
              Archive
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
