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
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // With the JWT strategy, `user` (from the Google profile) is only
    // passed in on initial sign-in -- persist what we need onto the
    // token here so it survives subsequent requests.
    jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
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
      return session;
    },
  },
});
