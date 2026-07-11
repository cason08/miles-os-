"use client";

import { useState } from "react";
import { createCommitmentAction, updateCommitmentAction } from "@/app/commitments/actions";
import { Button } from "@/components/ui/button";
import { COMMITMENT_TYPE_LABELS, type CommitmentInput } from "@/lib/commitment-types";
import { fieldClass as baseFieldClass } from "@/lib/ui";
import { toast } from "@/lib/toast";
import { useEscapeKey } from "@/lib/keyboard-shortcuts";

const fieldClass = `${baseFieldClass} w-full`;

export function CommitmentForm({
  accountOptions,
  initial,
  onDone,
  onCancel,
}: {
  accountOptions: { id: string; name: string }[];
  /** Present when editing an existing commitment; absent when creating. */
  initial?: CommitmentInput & { id: string };
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? Object.keys(COMMITMENT_TYPE_LABELS)[0]);
  const [expectedAmount, setExpectedAmount] = useState(
    initial ? String(initial.expectedAmount) : "",
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "SGD");
  const [expectedDayOfMonth, setExpectedDayOfMonth] = useState(
    initial ? String(initial.expectedDayOfMonth) : "1",
  );
  const [dayTolerance, setDayTolerance] = useState(
    initial ? String(initial.dayTolerance) : "3",
  );
  const [accountId, setAccountId] = useState(initial?.accountId ?? accountOptions[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEscapeKey(onCancel);

  async function handleSubmit() {
    const input: CommitmentInput = {
      name: name.trim(),
      type,
      expectedAmount: Number(expectedAmount),
      currency: currency.trim(),
      expectedDayOfMonth: Number(expectedDayOfMonth),
      dayTolerance: Number(dayTolerance),
      accountId,
    };

    setSaving(true);
    setError(null);
    const result = initial
      ? await updateCommitmentAction(initial.id, input)
      : await createCommitmentAction(input);
    setSaving(false);

    if ("error" in result) {
      setError(result.error);
      toast.error("Couldn't save commitment", result.error);
      return;
    }
    toast.success(initial ? "Commitment updated" : "Commitment created");
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
            placeholder="e.g. Netflix"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Type
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(COMMITMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Expected amount
          <input
            className={fieldClass}
            type="number"
            step="0.01"
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(e.target.value)}
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
          Expected day of month
          <input
            className={fieldClass}
            type="number"
            min={1}
            max={31}
            value={expectedDayOfMonth}
            onChange={(e) => setExpectedDayOfMonth(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Day tolerance (±)
          <input
            className={fieldClass}
            type="number"
            min={0}
            value={dayTolerance}
            onChange={(e) => setDayTolerance(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
          Paying account
          <select
            className={fieldClass}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accountOptions.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}

      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Add commitment"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
