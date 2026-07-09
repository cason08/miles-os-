import { convert } from "html-to-text";

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export type GmailMessageSummary = {
  id: string;
  sender: string;
  subject: string;
  receivedAt: Date;
};

async function gmailFetch(path: string, accessToken: string): Promise<unknown> {
  const res = await fetch(`${GMAIL_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gmail API error (${res.status}): ${body}`);
  }
  return res.json();
}

export function headerValue(headersList: { name: string; value: string }[], name: string): string {
  return headersList.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "(unknown)";
}

export type GmailMessagePart = {
  mimeType?: string;
  headers?: { name: string; value: string }[];
  body?: { size?: number; data?: string };
  parts?: GmailMessagePart[];
};

export type GmailMessageFull = {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  sizeEstimate?: number;
  payload?: GmailMessagePart;
};

export async function fetchMessageFull(
  accessToken: string,
  id: string,
): Promise<GmailMessageFull> {
  return (await gmailFetch(`/messages/${id}?format=full`, accessToken)) as GmailMessageFull;
}

// Recursively walks the MIME tree for the first part matching `mimeType`
// (e.g. "text/plain" or "text/html") and decodes its body. Gmail encodes
// part bodies as base64url; Node's Buffer supports that encoding natively.
export function findBodyPart(
  part: GmailMessagePart | undefined,
  mimeType: string,
): string | null {
  if (!part) return null;
  if (part.mimeType === mimeType && part.body?.data) {
    return Buffer.from(part.body.data, "base64url").toString("utf-8");
  }
  for (const child of part.parts ?? []) {
    const found = findBodyPart(child, mimeType);
    if (found) return found;
  }
  return null;
}

// Converts an email's HTML body into readable text -- for banks that send
// transaction alerts as HTML-only (no text/plain alternative part), this is
// the fallback source for the AI extraction pipeline. Preserves line breaks
// around block elements and table cells rather than collapsing everything
// into one run-on string, which a naive tag-strip would do.
export function htmlToReadableText(html: string): string {
  return convert(html, {
    wordwrap: false,
    // Without this, adjacent table cells are concatenated with no
    // separator (e.g. "Transaction AmountSGD 45.80") -- bank alert emails
    // commonly lay transaction details out in a table, so this is needed
    // for genuinely readable output rather than a run-on string.
    selectors: [{ selector: "table", format: "dataTable" }],
  });
}

// Hardcoded for now -- specific to my own accounts, not a general bank
// list/config system. Add more addresses here (e.g. UOB) when needed.
export const SUPPORTED_BANK_SENDERS = [
  "ibanking.alert@dbs.com",
  "alerts@citibank.com.sg",
  "noreply@notify.ocbc.com",
  "unialerts@uobgroup.com",
] as const;

export function buildBankSenderQuery(senders: readonly string[]): string {
  return senders.map((sender) => `from:${sender}`).join(" OR ");
}

export async function fetchRecentMessages(
  accessToken: string,
  count = 20,
): Promise<GmailMessageSummary[]> {
  const rawQuery = buildBankSenderQuery(SUPPORTED_BANK_SENDERS);
  const query = encodeURIComponent(rawQuery);
  const path = `/messages?maxResults=${count}&q=${query}`;

  // TEMPORARY diagnostic logging for the DBS-missing-results investigation.
  // Remove once root-caused.
  console.log("[gmail-search-debug] raw (decoded) q:", rawQuery);
  console.log("[gmail-search-debug] full request URL:", `${GMAIL_API_BASE}${path}`);

  const list = (await gmailFetch(path, accessToken)) as {
    messages?: { id: string }[];
    resultSizeEstimate?: number;
  };

  console.log(
    "[gmail-search-debug] combined query -- resultSizeEstimate:",
    list.resultSizeEstimate,
    "messages returned:",
    list.messages?.length ?? 0,
  );

  // Isolation check: run the DBS sender alone (diagnostic only -- does not
  // affect what's returned to the page) to see whether the OR-combination
  // itself is the problem, or DBS specifically returns nothing even alone.
  const dbsOnlyQuery = encodeURIComponent("from:ibanking.alert@dbs.com");
  const dbsOnly = (await gmailFetch(
    `/messages?maxResults=${count}&q=${dbsOnlyQuery}`,
    accessToken,
  )) as { messages?: { id: string }[]; resultSizeEstimate?: number };
  console.log(
    "[gmail-search-debug] DBS-only query -- resultSizeEstimate:",
    dbsOnly.resultSizeEstimate,
    "messages returned:",
    dbsOnly.messages?.length ?? 0,
  );

  const ids = list.messages ?? [];

  const messages = await Promise.all(
    ids.map(async ({ id }) => {
      const detail = (await gmailFetch(
        `/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
        accessToken,
      )) as { payload?: { headers?: { name: string; value: string }[] }; internalDate?: string };

      const messageHeaders = detail.payload?.headers ?? [];
      return {
        id,
        sender: headerValue(messageHeaders, "From"),
        subject: headerValue(messageHeaders, "Subject"),
        receivedAt: new Date(Number(detail.internalDate ?? 0)),
      };
    }),
  );

  const sorted = messages.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

  // TEMPORARY diagnostic logging for the rendering-pipeline investigation.
  // Logs exactly what this function returns to its caller (i.e. exactly
  // what /debug/gmail maps over to render) -- remove once root-caused.
  console.log(
    "[gmail-render-debug] first 10 of",
    sorted.length,
    "messages returned by fetchRecentMessages:",
  );
  for (const m of sorted.slice(0, 10)) {
    console.log("[gmail-render-debug]", {
      id: m.id,
      sender: m.sender,
      subject: m.subject,
      receivedAt: m.receivedAt.toISOString(),
    });
  }

  return sorted;
}
