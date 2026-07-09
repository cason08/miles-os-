"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { runDailySyncAction } from "@/app/actions";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Last sync: {lastSyncedLabel}</span>
        <button
          type="button"
          onClick={handleSync}
          disabled={pending}
          aria-label="Sync Gmail now"
          className="cursor-pointer border-none bg-transparent p-0 text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground disabled:cursor-default"
        >
          <RefreshCw className={cn("size-3.5", pending && "animate-spin")} strokeWidth={1.75} />
        </button>
      </div>
      {result && (
        <p
          className={cn(
            "max-w-xs text-right text-xs",
            result.kind === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {result.kind === "error" && result.message}
          {result.kind === "up-to-date" &&
            "✓ Already up to date — no new supported bank emails found."}
          {result.kind === "complete" &&
            `✓ Sync complete — Imported: ${result.imported}, Ignored: ${result.ignored}, Failed: ${result.failed}`}
        </p>
      )}
    </div>
  );
}
