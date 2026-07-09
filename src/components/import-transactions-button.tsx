"use client";

import { useState } from "react";
import Link from "next/link";
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

          {result.failed > 0 && (
            <>
              <h2>Failure Breakdown</h2>
              <ul>
                {Object.entries(result.failureBreakdown).map(([category, count]) => (
                  <li key={category}>
                    {count} {category.toLowerCase()}
                    {count === 1 ? "" : "s"}
                  </li>
                ))}
              </ul>

              <details>
                <summary>Show {result.failures.length} failed emails</summary>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Gmail ID</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Subject</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Sender</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Stage</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failures.map((failure) => (
                      <tr key={failure.gmailMessageId} style={{ borderTop: "1px solid #ccc" }}>
                        <td style={{ padding: "4px 8px", verticalAlign: "top" }}>
                          <Link href={`/debug/email/${failure.gmailMessageId}`}>
                            {failure.gmailMessageId}
                          </Link>
                        </td>
                        <td style={{ padding: "4px 8px", verticalAlign: "top" }}>
                          {failure.subject}
                        </td>
                        <td style={{ padding: "4px 8px", verticalAlign: "top" }}>
                          {failure.sender}
                        </td>
                        <td style={{ padding: "4px 8px", verticalAlign: "top" }}>
                          {failure.stage}
                        </td>
                        <td style={{ padding: "4px 8px", verticalAlign: "top" }}>
                          {failure.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </>
      )}
    </div>
  );
}
