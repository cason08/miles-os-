"use client";

import { useState } from "react";
import { runImport } from "@/app/debug/import/actions";
import type { ImportSummary } from "@/lib/historical-import";

type Result = ImportSummary | { error: string };

export function ImportTransactionsButton() {
  const [loading, setLoading] = useState<"preview" | "import" | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleClick(dryRun: boolean) {
    setLoading(dryRun ? "preview" : "import");
    setResult(null);
    const outcome = await runImport(dryRun);
    setResult(outcome);
    setLoading(null);
  }

  return (
    <div>
      <button type="button" onClick={() => handleClick(true)} disabled={loading !== null}>
        {loading === "preview" ? "Previewing..." : "Preview (dry run)"}
      </button>{" "}
      <button type="button" onClick={() => handleClick(false)} disabled={loading !== null}>
        {loading === "import" ? "Importing..." : "Run Import"}
      </button>

      {result && "error" in result && (
        <>
          <h2>Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>{result.error}</pre>
        </>
      )}

      {result && "processed" in result && (
        <>
          <h2>{result.dryRun ? "Dry Run Summary" : "Import Summary"}</h2>
          <ul>
            <li>Processed: {result.processed}</li>
            <li>
              {result.dryRun ? "Would import" : "Imported"}: {result.imported}
            </li>
            <li>Skipped: {result.skipped}</li>
            <li>Failed: {result.failed}</li>
            <li>Duration: {(result.durationMs / 1000).toFixed(1)}s</li>
          </ul>
        </>
      )}
    </div>
  );
}
