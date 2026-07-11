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
};
