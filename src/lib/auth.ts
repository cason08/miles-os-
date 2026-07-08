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
});
