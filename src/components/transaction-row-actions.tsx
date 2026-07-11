"use client";

import { Button } from "@/components/ui/button";

// Gmail-style delete: no confirmation dialog -- the parent
// (TransactionRowEditable) hides the row immediately and shows a 5s Undo
// toast instead, per DESIGN_SYSTEM_V2.md's "Delete" interaction guidance.
export function TransactionRowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
        Edit
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
