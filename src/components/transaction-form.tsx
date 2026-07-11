"use client";

import { useState } from "react";
import { createTransactionAction, updateTransactionAction } from "@/app/transactions/actions";
import { Button } from "@/components/ui/button";
import type { TransactionInput } from "@/lib/transactions";
import { fieldClass as baseFieldClass } from "@/lib/ui";
import { toast } from "@/lib/toast";

const fieldClass = `${baseFieldClass} w-full`;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  accountOptions,
  categories,
  initial,
  onDone,
  onCancel,
}: {
  accountOptions: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  /** Present when editing an existing transaction; absent when creating. */
  initial?: TransactionInput & { id: string };
  onDone: () => void;
  onCancel: () => void;
}) {
  const [merchant, setMerchant] = useState(initial?.merchant ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [direction, setDirection] = useState(initial?.direction ?? "out");
  const [accountId, setAccountId] = useState(initial?.accountId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [date, setDate] = useState(initial?.date ?? today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const input: TransactionInput = {
      merchant: merchant.trim(),
      amount: Number(amount),
      direction,
      accountId: accountId === "" ? null : accountId,
      categoryId: categoryId === "" ? null : categoryId,
      date,
    };

    setSaving(true);
    setError(null);
    const result = initial
      ? await updateTransactionAction(initial.id, input)
      : await createTransactionAction(input);
    setSaving(false);

    if ("error" in result) {
      setError(result.error);
      toast.error("Couldn't save transaction", result.error);
      return;
    }
    toast.success(initial ? "Transaction updated" : "Transaction added");
    onDone();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Merchant / Description
          <input
            className={fieldClass}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="e.g. Cold Storage"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Amount
          <input
            className={fieldClass}
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Type
          <select
            className={fieldClass}
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="out">Expense</option>
            <option value="in">Income</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Date
          <input
            className={fieldClass}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Account / Card
          <select
            className={fieldClass}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {accountOptions.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Category
          <select
            className={fieldClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}

      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Add transaction"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
