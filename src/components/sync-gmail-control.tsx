"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { runDailySyncAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { ImportSummary } from "@/lib/historical-import";

export function SyncGmailControl({ lastSyncedLabel }: { lastSyncedLabel: string }) {
  const [pending, setPending] = useState(false);

  async function handleSync() {
    setPending(true);
    const outcome = await runDailySyncAction();
    setPending(false);

    if ("error" in outcome) {
      toast.error("Sync failed", outcome.error);
      return;
    }

    // DESIGN_SYSTEM_V2.md §16/§18 -- Sync's only visible effect used to be
    // this inline result line; a toast is the right feedback for a
    // short-lived confirmation like this, not a persistent piece of UI.
    const { imported, ignored, failed } = outcome as ImportSummary;
    if (imported + ignored + failed === 0) {
      toast.info("Already up to date", "No new supported bank emails found.");
    } else {
      toast.success(
        "Sync complete",
        `Imported: ${imported}, Ignored: ${ignored}, Failed: ${failed}`,
      );
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Last sync: {lastSyncedLabel}</span>
      <button
        type="button"
        onClick={handleSync}
        disabled={pending}
        aria-label="Sync Gmail now"
        className="cursor-pointer border-none bg-transparent p-0 text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground disabled:cursor-default"
      >
        <RefreshCw className={cn("size-3.5", pending && "animate-spin")} strokeWidth={1.75} />
      </button>
    </div>
  );
}
