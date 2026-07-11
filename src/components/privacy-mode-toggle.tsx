"use client";

import { Eye, EyeOff } from "lucide-react";
import { usePrivacyMode } from "@/components/privacy-mode-provider";

// Borderless icon button, same treatment as the refresh icon in
// SyncGmailControl -- no card/button chrome, muted until hovered, instant
// click-driven toggle (no hover-to-reveal, so it behaves identically on
// touch devices with no hover state at all).
export function PrivacyModeToggle() {
  const { isPrivate, toggle } = usePrivacyMode();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isPrivate ? "Show financial figures" : "Hide financial figures"}
      aria-pressed={isPrivate}
      className="-m-2 flex cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-2 text-muted-foreground outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {isPrivate ? (
        <EyeOff className="size-4" strokeWidth={1.75} />
      ) : (
        <Eye className="size-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
