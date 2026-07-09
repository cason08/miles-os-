"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommitmentForm } from "@/components/commitment-form";
import { CommitmentRow } from "@/components/commitment-row";
import type { CommitmentWithStatus } from "@/lib/commitment-types";

export function CommitmentList({
  commitments,
  accountOptions,
}: {
  commitments: CommitmentWithStatus[];
  accountOptions: { id: string; name: string }[];
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {commitments.length} commitment{commitments.length === 1 ? "" : "s"}
        </span>
        {!creating && (
          <Button type="button" size="sm" onClick={() => setCreating(true)}>
            + New Commitment
          </Button>
        )}
      </div>

      {creating && (
        <Card>
          <CommitmentForm
            accountOptions={accountOptions}
            onDone={() => setCreating(false)}
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {commitments.length === 0 && !creating ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No commitments yet. Add a recurring bill (insurance, a loan, a subscription — anything
            that comes out on roughly the same day each month) to start tracking it here.
          </p>
        </Card>
      ) : (
        commitments.length > 0 && (
          <Card className="gap-0 divide-y divide-border p-0">
            {commitments.map((commitment) =>
              editingId === commitment.id ? (
                <div key={commitment.id} className="p-4">
                  <CommitmentForm
                    accountOptions={accountOptions}
                    initial={commitment}
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <CommitmentRow
                  key={commitment.id}
                  commitment={commitment}
                  onEdit={() => setEditingId(commitment.id)}
                />
              ),
            )}
          </Card>
        )
      )}
    </div>
  );
}
