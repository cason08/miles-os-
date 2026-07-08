import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// M1A: any Google account may sign in. Access will be restricted to a
// single allow-listed email (PRODUCT.md §6.11) before deployment.
export const { handlers, auth, signIn, signOut } = NextAuth({
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
