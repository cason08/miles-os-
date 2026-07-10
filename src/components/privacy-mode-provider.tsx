"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

const STORAGE_KEY = "milesos:privacyMode";

// Module-level, not React state -- useSyncExternalStore is the primitive
// built for exactly this (subscribe to an external store, e.g.
// localStorage, in an SSR-safe way) rather than a useEffect+setState combo,
// which would need to fake an initial value during the server/first-client
// render and then patch it after mount, risking a hydration mismatch.
const listeners = new Set<() => void>();

function getSnapshot(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

// No window during SSR -- this is what the server (and React's first
// hydration pass) renders, matched exactly by getSnapshot() returning the
// same "false" default whenever localStorage has nothing stored yet.
function getServerSnapshot(): boolean {
  return false;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setPrivacyMode(next: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, String(next));
  listeners.forEach((listener) => listener());
}

type PrivacyModeContextValue = {
  isPrivate: boolean;
  toggle: () => void;
};

const PrivacyModeContext = createContext<PrivacyModeContextValue | null>(null);

export function PrivacyModeProvider({ children }: { children: React.ReactNode }) {
  const isPrivate = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => setPrivacyMode(!getSnapshot()), []);

  return (
    <PrivacyModeContext.Provider value={{ isPrivate, toggle }}>
      {children}
    </PrivacyModeContext.Provider>
  );
}

// One shared toggle for every protected value, rather than each figure
// managing its own state -- any component anywhere in the tree can call
// this to read/flip the same Privacy Mode, which is what lets future
// figures (account balances, credit card balances, investment values)
// respect it with zero additional plumbing.
export function usePrivacyMode(): PrivacyModeContextValue {
  const context = useContext(PrivacyModeContext);
  if (!context) {
    throw new Error("usePrivacyMode must be used within a PrivacyModeProvider");
  }
  return context;
}
