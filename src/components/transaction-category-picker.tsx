"use client";

import { useState } from "react";
import {
  setTransactionCategoryAction,
  createMerchantRuleAction,
} from "@/app/transactions/actions";

export function TransactionCategoryPicker({
  transactionId,
  merchant,
  categoryId,
  categories,
}: {
  transactionId: string;
  merchant: string;
  categoryId: string | null;
  categories: { id: string; name: string }[];
}) {
  const [value, setValue] = useState(categoryId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerRule, setOfferRule] = useState(false);
  const [ruleCreated, setRuleCreated] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const previous = value;
    const next = e.target.value;
    setValue(next);
    setSaving(true);
    setError(null);
    setRuleCreated(false);
    const result = await setTransactionCategoryAction(transactionId, next === "" ? null : next);
    setSaving(false);
    if ("error" in result) {
      setValue(previous);
      setError(result.error);
      setOfferRule(false);
      return;
    }
    setOfferRule(next !== "");
  }

  async function handleCreateRule() {
    if (!value) return;
    setSaving(true);
    const result = await createMerchantRuleAction(value, merchant);
    setSaving(false);
    if (!("error" in result)) {
      setRuleCreated(true);
      setOfferRule(false);
    }
  }

  const selectedCategory = categories.find((c) => c.id === value);

  return (
    <div className="flex flex-col items-end gap-0.5">
      <select
        className="rounded-md border border-border bg-background px-1.5 py-1 text-xs text-muted-foreground disabled:opacity-60"
        value={value}
        onChange={handleChange}
        disabled={saving}
      >
        <option value="">Uncategorized</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
      {offerRule && selectedCategory && (
        <button
          type="button"
          onClick={handleCreateRule}
          disabled={saving}
          className="max-w-[12rem] text-right text-[10px] text-primary hover:underline disabled:opacity-60"
        >
          Auto-categorize &quot;{merchant}&quot; as {selectedCategory.name} in future
        </button>
      )}
      {ruleCreated && <span className="text-[10px] text-muted-foreground">Rule created</span>}
    </div>
  );
}
