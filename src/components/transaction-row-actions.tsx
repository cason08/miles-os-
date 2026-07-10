"use client";

import { useState } from "react";
import { deleteTransactionAction } from "@/app/transactions/actions";
import { Button } from "@/components/ui/button";

export function TransactionRowActions({
  transactionId,
  onEdit,
}: {
  transactionId: string;
  onEdit: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteTransactionAction(transactionId);
    setDeleting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setConfirmingDelete(false);
  }

  if (confirmingDelete) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Delete?</span>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Yes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirmingDelete(false)}
          disabled={deleting}
        >
          Cancel
        </Button>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
        Edit
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
        Delete
      </Button>
    </div>
  );
}
