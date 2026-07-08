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
  // TEMP DEBUG (stage 4): confirm getToken() found *a* token at all, and
  // separately whether that token carries gmailAccessToken.
  console.log("[gmail-debug:getToken] token present:", !!token);
  if (token) {
    console.log("[gmail-debug:getToken] token keys:", Object.keys(token));
    console.log(
      "[gmail-debug:getToken] gmailAccessToken present:",
      !!token.gmailAccessToken,
    );
  }
  return token?.gmailAccessToken ?? null;
}
