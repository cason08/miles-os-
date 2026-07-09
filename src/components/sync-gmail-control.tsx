"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { runDailySyncAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { ImportSummary } from "@/lib/historical-import";

type SyncResult =
  | { kind: "complete"; imported: number; ignored: number; failed: number }
  | { kind: "up-to-date" }
  | { kind: "error"; message: string };

export function SyncGmailControl({ lastSyncedLabel }: { lastSyncedLabel: string }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function handleSync() {
    setPending(true);
    setResult(null);
    const outcome = await runDailySyncAction();
    setPending(false);

    if ("error" in outcome) {
      setResult({ kind: "error", message: outcome.error });
      return;
    }

    const { imported, ignored, failed } = outcome as ImportSummary;
    setResult(
      imported + ignored + failed === 0
        ? { kind: "up-to-date" }
        : { kind: "complete", imported, ignored, failed },
    );
  }

  return (
    <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <Mail className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-medium">Gmail sync</p>
          <p className="text-sm text-muted-foreground">Last synced: {lastSyncedLabel}</p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        <Button type="button" onClick={handleSync} disabled={pending}>
          {pending ? "Syncing..." : "Sync Now"}
        </Button>
        {result && (
          <p className="max-w-xs text-xs text-muted-foreground sm:text-right">
            {result.kind === "error" && result.message}
            {result.kind === "up-to-date" &&
              "✓ Already up to date — No new supported bank emails found."}
            {result.kind === "complete" &&
              `✓ Sync complete — Imported: ${result.imported}, Ignored: ${result.ignored}, Failed: ${result.failed}`}
          </p>
        )}
      </div>
    </div>
  );
}
