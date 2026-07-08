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

function headerValue(headersList: { name: string; value: string }[], name: string): string {
  return headersList.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "(unknown)";
}

export async function fetchRecentMessages(
  accessToken: string,
  count = 20,
): Promise<GmailMessageSummary[]> {
  const list = (await gmailFetch(`/messages?maxResults=${count}`, accessToken)) as {
    messages?: { id: string }[];
  };
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

  return messages.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
}
