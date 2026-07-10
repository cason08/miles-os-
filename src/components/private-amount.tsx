"use client";

import { usePrivacyMode } from "@/components/privacy-mode-provider";

const MASK = "S$••••••••";

// Wraps a single pre-formatted SGD amount so it respects the shared
// Privacy Mode toggle -- swap in here wherever a new figure (an account
// balance, a credit card balance, an investment value) should start
// respecting the same toggle, with no other plumbing required.
export function PrivateAmount({ value }: { value: string }) {
  const { isPrivate } = usePrivacyMode();
  return <>{isPrivate ? MASK : value}</>;
}
