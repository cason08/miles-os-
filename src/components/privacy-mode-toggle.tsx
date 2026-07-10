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
      className="cursor-pointer border-none bg-transparent p-0 text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
    >
      {isPrivate ? (
        <EyeOff className="size-4" strokeWidth={1.75} />
      ) : (
        <Eye className="size-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
