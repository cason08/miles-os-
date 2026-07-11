"use client";

import { useState } from "react";
import { saveAccountBalance } from "@/app/accounts/actions";
import { Button } from "@/components/ui/button";
import type { AccountRowData } from "@/lib/accounts";
import { fieldClass } from "@/lib/ui";
import { toast } from "@/lib/toast";

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
      toast.error("Couldn't update balance", result.error);
      return;
    }
    toast.success("Balance updated");
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 transition-colors duration-150 hover:bg-muted/40">
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
            className={`${fieldClass} w-28 tabular-nums`}
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
