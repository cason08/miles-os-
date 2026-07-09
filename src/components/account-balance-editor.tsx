"use client";

import { useState } from "react";
import { saveAccountBalance } from "@/app/accounts/actions";
import { Button } from "@/components/ui/button";
import type { AccountRowData } from "@/lib/accounts";

export function AccountBalanceEditor({ account }: { account: AccountRowData }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setValue("");
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      setError("Enter a valid number.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveAccountBalance(account.id, parsed);
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{account.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          Updated {account.updatedAt}
        </span>
      </div>

      {editing ? (
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="number"
            step="0.01"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="w-28 rounded-md border border-border bg-background px-2 py-1 text-sm tabular-nums"
          />
          <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-right text-sm font-medium tabular-nums">{account.balance}</span>
          <Button type="button" variant="ghost" size="sm" onClick={startEditing}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
