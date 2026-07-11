"use client";

import { useEffect } from "react";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

// Fires regardless of focus -- Esc closing an open form/dialog should work
// even while a field inside it is focused, unlike the single-key shortcuts
// below.
export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onEscape();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);
}

// Single-key shortcuts (DESIGN_SYSTEM_V2.md's `A` / `/`) -- ignored while
// typing anywhere on the page, so they never hijack a literal "a" or "/"
// being entered into a field, and ignored with a modifier held so browser/OS
// shortcuts on the same key keep working.
export function useKeyboardShortcut(key: string, handler: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== key) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      handler();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, handler]);
}
