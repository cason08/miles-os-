import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    gmailConnected?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    gmailConnected?: boolean;
    // Server-side only -- deliberately never mirrored onto Session above.
    gmailAccessToken?: string;
  }
}
