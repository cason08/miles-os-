import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

// Reads the raw session JWT directly (never through the `session()`
// callback / `auth()`), so the Gmail access token is only ever seen
// server-side and never enters the client-facing session shape.
export async function getGmailAccessToken(): Promise<string | null> {
  const token = await getToken({
    req: { headers: await headers() },
    secret: process.env.AUTH_SECRET,
  });
  return token?.gmailAccessToken ?? null;
}
