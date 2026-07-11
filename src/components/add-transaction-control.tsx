"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transaction-form";
import { useKeyboardShortcut } from "@/lib/keyboard-shortcuts";

export function AddTransactionControl({
  accountOptions,
  categories,
}: {
  accountOptions: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [creating, setCreating] = useState(false);

  // DESIGN_SYSTEM_V2.md keyboard shortcuts -- `A` opens Add Transaction.
  useKeyboardShortcut("a", () => setCreating(true));

  if (!creating) {
    return (
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={() => setCreating(true)}>
          + Add Transaction
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <TransactionForm
        accountOptions={accountOptions}
        categories={categories}
        onDone={() => setCreating(false)}
        onCancel={() => setCreating(false)}
      />
    </Card>
  );
}
