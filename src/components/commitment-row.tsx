"use client";

import { useState } from "react";
import { deleteCommitmentAction } from "@/app/commitments/actions";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import {
  COMMITMENT_TYPE_LABELS,
  type CommitmentStatus,
  type CommitmentWithStatus,
} from "@/lib/commitment-types";
import { toast } from "@/lib/toast";

const STATUS_LABEL: Record<CommitmentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

const STATUS_VARIANT: Record<CommitmentStatus, StatusBadgeVariant> = {
  paid: "success",
  pending: "neutral",
  overdue: "error",
};

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === "SGD" ? "S$" : `${currency} `;
  const value = amount.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${value}`;
}

function ordinal(day: number): string {
  if (day % 10 === 1 && day !== 11) return `${day}st`;
  if (day % 10 === 2 && day !== 12) return `${day}nd`;
  if (day % 10 === 3 && day !== 13) return `${day}rd`;
  return `${day}th`;
}

export function CommitmentRow({
  commitment,
  onEdit,
}: {
  commitment: CommitmentWithStatus;
  onEdit: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteCommitmentAction(commitment.id);
    setDeleting(false);
    if ("error" in result) {
      setError(result.error);
      toast.error("Couldn't delete commitment", result.error);
      return;
    }
    toast.success("Commitment deleted");
    setConfirmingDelete(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 transition-colors duration-150 hover:bg-muted/40">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{commitment.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {COMMITMENT_TYPE_LABELS[commitment.type] ?? commitment.type} · Due ~
          {ordinal(commitment.expectedDayOfMonth)} (±{commitment.dayTolerance}d) ·{" "}
          {commitment.accountName}
        </span>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge variant={STATUS_VARIANT[commitment.status]}>
          {STATUS_LABEL[commitment.status]}
        </StatusBadge>
        <span className="text-right text-sm font-medium tabular-nums">
          {formatCurrency(commitment.expectedAmount, commitment.currency)}
        </span>

        {confirmingDelete ? (
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
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              Edit
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
