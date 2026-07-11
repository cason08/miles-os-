"use client";

import { Toast } from "@base-ui/react/toast";

// A module-level manager (Base UI's own mechanism for this, not a new
// state library) means any client component can call toast.success(...)
// directly, with no hook or prop-drilling required -- the single
// <ToastProvider> in the root layout is the only thing that needs to know
// this exists.
export const toastManager = Toast.createToastManager();

export const toast = {
  success(title: string, description?: string) {
    toastManager.add({ title, description, type: "success" });
  },
  error(title: string, description?: string) {
    // Longer timeout than success/info (DESIGN_SYSTEM_V2.md §18) -- an
    // error is more likely to need actually reading.
    toastManager.add({ title, description, type: "error", timeout: 6000 });
  },
  info(title: string, description?: string) {
    toastManager.add({ title, description, type: "info" });
  },
  // DESIGN_SYSTEM_V2.md §18 -- exactly 5s, matching the Gmail-style undo
  // window. `onUndo` runs the caller's rollback; closing the toast here
  // (rather than waiting for its own timeout) gives immediate feedback
  // that the undo was registered.
  undo(title: string, onUndo: () => void, description?: string) {
    const id = toastManager.add({
      title,
      description,
      type: "undo",
      timeout: 5000,
      actionProps: {
        onClick: () => {
          onUndo();
          toastManager.close(id);
        },
      },
    });
  },
};
