"use client";

import { cn } from "@/lib/utils";
import { usePrivacyMode } from "@/components/privacy-mode-provider";

const MASK = "S$••••••••";

// Wraps a single pre-formatted SGD amount so it respects the shared
// Privacy Mode toggle -- swap in here wherever a new figure (an account
// balance, a credit card balance, an investment value) should start
// respecting the same toggle, with no other plumbing required.
//
// Both states are stacked in the same grid cell (DESIGN_SYSTEM_V2.md's
// cross-fade requirement) so toggling only changes opacity -- no layout
// shift, and the container settles to whichever string is wider.
export function PrivateAmount({ value }: { value: string }) {
  const { isPrivate } = usePrivacyMode();
  return (
    <span className="isolate inline-grid *:col-start-1 *:row-start-1">
      <span
        aria-hidden={isPrivate}
        className={cn("transition-opacity duration-300", isPrivate && "opacity-0")}
      >
        {value}
      </span>
      <span
        aria-hidden={!isPrivate}
        className={cn("transition-opacity duration-300", !isPrivate && "opacity-0")}
      >
        {MASK}
      </span>
    </span>
  );
}
