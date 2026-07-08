import Link from "next/link";
import { auth } from "@/lib/auth";
import { getGmailAccessToken } from "@/lib/gmail-token";
import { fetchMessageFull, findBodyPart, headerValue, type GmailMessageFull } from "@/lib/gmail";
import { ExtractTransactionButton } from "@/components/extract-transaction-button";

const backLink = (
  <p>
    <Link href="/debug/gmail">← Back to Gmail messages</Link>
  </p>
);

export default async function DebugEmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.gmailConnected) {
    return (
      <main style={{ fontFamily: "monospace", padding: 24 }}>
        {backLink}
        <p>Gmail isn&apos;t connected — connect it from Home first.</p>
      </main>
    );
  }

  const accessToken = await getGmailAccessToken();
  if (!accessToken) {
    return (
      <main style={{ fontFamily: "monospace", padding: 24 }}>
        {backLink}
        <p>No Gmail access token found in the session — reconnect Gmail from Home.</p>
      </main>
    );
  }

  let message: GmailMessageFull | null = null;
  let error: string | null = null;
  try {
    message = await fetchMessageFull(accessToken, id);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const headers = message?.payload?.headers ?? [];
  const plainText = message ? findBodyPart(message.payload, "text/plain") : null;
  const html = message ? findBodyPart(message.payload, "text/html") : null;

  return (
    <main style={{ fontFamily: "monospace", padding: 24 }}>
      {backLink}

      {error && <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>{error}</pre>}

      {!error && message && (
        <>
          <p>
            <strong>From:</strong> {headerValue(headers, "From")}
          </p>
          <p>
            <strong>To:</strong> {headerValue(headers, "To")}
          </p>
          <p>
            <strong>Subject:</strong> {headerValue(headers, "Subject")}
          </p>
          <p>
            <strong>Date:</strong> {headerValue(headers, "Date")}
          </p>

          <h2>Snippet</h2>
          <p>{message.snippet}</p>

          <h2>Plain text body</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{plainText ?? "(none)"}</pre>

          <h2>Raw HTML source</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{html ?? "(none)"}</pre>

          <h2>Raw Gmail API JSON</h2>
          <details>
            <summary>Show raw JSON</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(message, null, 2)}</pre>
          </details>

          {plainText && (
            <>
              <h2>AI Prompt Playground</h2>
              <ExtractTransactionButton plainText={plainText} />
            </>
          )}
        </>
      )}
    </main>
  );
}
