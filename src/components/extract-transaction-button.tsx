"use client";

import { useState } from "react";
import { extractTransaction, type ExtractResult } from "@/app/debug/email/[id]/actions";

export function ExtractTransactionButton({
  emailText,
  receivedAtDate,
  gmailMessageId,
  gmailThreadId,
  gmailReceivedAtIso,
}: {
  emailText: string;
  receivedAtDate: string | null;
  gmailMessageId: string;
  gmailThreadId: string;
  gmailReceivedAtIso: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    const outcome = await extractTransaction(
      emailText,
      receivedAtDate,
      gmailMessageId,
      gmailThreadId,
      gmailReceivedAtIso,
    );
    setResult(outcome);
    setLoading(false);
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={loading}>
        {loading ? "Extracting..." : "Extract Transaction"}
      </button>

      {result && "error" in result && (
        <>
          <h2>Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>{result.error}</pre>
        </>
      )}

      {result && "responseText" in result && (
        <>
          <h2>Prompt sent</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result.prompt}</pre>

          <h2>Raw AI response</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result.responseText}</pre>

          <h2>Validation result</h2>
          {result.validation.success ? (
            <p style={{ color: "green" }}>✓ Validation succeeded</p>
          ) : (
            <>
              <p style={{ color: "crimson" }}>✗ Validation failed</p>
              <ul style={{ color: "crimson" }}>
                {result.validation.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </>
          )}

          {result.validation.success && (
            <>
              <h2>Parsed Transaction object</h2>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(result.validation.transaction, null, 2)}
              </pre>
            </>
          )}

          {result.persisted && (
            <>
              <h2>Persisted</h2>
              <p style={{ color: "green" }}>✓ Saved to database (id: {result.persisted.id})</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(result.persisted, null, 2)}
              </pre>
            </>
          )}
        </>
      )}
    </div>
  );
}
