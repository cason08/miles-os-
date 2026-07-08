import Link from "next/link";
import { auth } from "@/lib/auth";
import { getGmailAccessToken } from "@/lib/gmail-token";
import { fetchRecentMessages, type GmailMessageSummary } from "@/lib/gmail";

export default async function DebugGmailPage() {
  const session = await auth();

  if (!session?.gmailConnected) {
    return (
      <main style={{ fontFamily: "monospace", padding: 24 }}>
        <h1>Recent Gmail Messages</h1>
        <p>Gmail isn&apos;t connected — connect it from Home first.</p>
      </main>
    );
  }

  const accessToken = await getGmailAccessToken();
  if (!accessToken) {
    return (
      <main style={{ fontFamily: "monospace", padding: 24 }}>
        <h1>Recent Gmail Messages</h1>
        <p>No Gmail access token found in the session — reconnect Gmail from Home.</p>
      </main>
    );
  }

  let messages: GmailMessageSummary[] = [];
  let error: string | null = null;
  try {
    messages = await fetchRecentMessages(accessToken);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <main style={{ fontFamily: "monospace", padding: 24 }}>
      <h1>Recent Gmail Messages</h1>

      {error && (
        <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>{error}</pre>
      )}

      {!error && messages.length === 0 && <p>No supported bank emails found.</p>}

      {!error && messages.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((message) => (
            <li key={message.id} style={{ borderBottom: "1px solid #ccc" }}>
              <Link
                href={`/debug/email/${message.id}`}
                style={{ display: "block", padding: "8px 0", color: "inherit" }}
              >
                <div>{message.sender}</div>
                <div>{message.subject}</div>
                <div>{message.receivedAt.toLocaleString()}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
