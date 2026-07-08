"use client";

import { useState } from "react";
import { extractTransaction } from "@/app/debug/email/[id]/actions";

type Result = { prompt: string; responseText: string } | { error: string };

export function ExtractTransactionButton({ plainText }: { plainText: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    const outcome = await extractTransaction(plainText);
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
        </>
      )}
    </div>
  );
}
