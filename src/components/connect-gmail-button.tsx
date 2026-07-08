"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

const GMAIL_READONLY_SCOPE =
  "openid email profile https://www.googleapis.com/auth/gmail.readonly";

export function ConnectGmailButton() {
  return (
    <Button
      type="button"
      onClick={() =>
        signIn("google", { callbackUrl: "/" }, { scope: GMAIL_READONLY_SCOPE })
      }
    >
      Connect Gmail
    </Button>
  );
}
