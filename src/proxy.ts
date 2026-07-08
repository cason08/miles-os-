import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  // Check for a real, valid session (`req.auth.user`), not just any
  // truthy `req.auth`. When the underlying session lookup errors (e.g.
  // a misconfigured/missing AUTH_SECRET), Auth.js resolves `req.auth` to
  // an error-shaped object like `{ message: "..." }` rather than null --
  // which is truthy, so a bare `if (!req.auth)` check fails open and
  // treats a broken auth config as "signed in." Requiring `.user`
  // specifically means only an actual session lets the request through.
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
