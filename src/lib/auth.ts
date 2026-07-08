import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// M1A: any Google account may sign in. Access will be restricted to a
// single allow-listed email (PRODUCT.md §6.11) before deployment.
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Read explicitly rather than relying on next-auth's own env-var
  // auto-detection (see root-cause note in the commit history): that
  // auto-detection only runs once, the first time this config object is
  // built, and can end up permanently caching an empty secret if it runs
  // before `AUTH_SECRET` is available in `process.env` for that particular
  // build of this module. Reading it ourselves, the same way we already do
  // for GOOGLE_CLIENT_ID/SECRET below, removes that dependency entirely.
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Requesting the Gmail scope by default (not only from the
      // "Connect Gmail" button) means every sign-in -- including a plain
      // re-login -- reports the user's *current* grant in `account.scope`.
      // Google auto-approves already-granted scopes silently and only
      // prompts for genuinely new ones, so this is how "Gmail connected"
      // status survives sign-out without a database: we re-derive it
      // from Google each time rather than storing it ourselves.
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // `user`/`account` are only passed in on sign-in (not subsequent
    // requests) -- persist what we need onto the token so it survives.
    jwt({ token, user, account }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      if (account?.provider === "google") {
        token.gmailConnected = account.scope?.includes("gmail.readonly") ?? false;
        // Server-side only -- never copied onto `session` below. Short-lived
        // (~1hr); no refresh token is requested yet (see M2 plan), so an
        // expired token surfaces as a plain Gmail API error, not silently
        // refreshed.
        token.gmailAccessToken = account.access_token;
      }
      return token;
    },
    // The session object sent to the client isn't auto-populated from
    // the token -- copy the fields we want exposed explicitly.
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email ?? session.user.email;
      }
      session.gmailConnected = token.gmailConnected ?? false;
      return session;
    },
  },
});
