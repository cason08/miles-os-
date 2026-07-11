"use client";

import { Toast } from "@base-ui/react/toast";
import { CheckCircle2, Info, Trash2, X, XCircle } from "lucide-react";
import { toastManager } from "@/lib/toast";

// DESIGN_SYSTEM_V2.md §18 -- one toast region, four kinds distinguished by
// a left accent stripe + icon only (never a filled colour background,
// consistent with Status Badge being the one place colour fills a shape).
// Base UI sets data-type on the root automatically from each toast's
// `type`, so the accent/icon can be selected in CSS/JSX without any
// bookkeeping of our own.
const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  undo: Trash2,
} as const;

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-full sm:max-w-sm">
        {toasts.map((item) => {
          const Icon = TOAST_ICONS[item.type as keyof typeof TOAST_ICONS] ?? Info;
          return (
            <Toast.Root
              key={item.id}
              toast={item}
              className="relative flex items-start gap-3 rounded-xl border border-l-2 border-border/70 bg-popover bg-[image:var(--gradient-card)] p-4 pr-8 text-popover-foreground shadow-md transition-all duration-300 data-[ending-style]:translate-y-1 data-[starting-style]:translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[ending-style]:duration-150 data-[type=error]:border-l-destructive data-[type=info]:border-l-primary data-[type=success]:border-l-success data-[type=undo]:border-l-muted-foreground"
            >
              <Icon
                className="mt-0.5 size-4 shrink-0 data-[type=error]:text-destructive data-[type=info]:text-primary data-[type=success]:text-success data-[type=undo]:text-muted-foreground"
                data-type={item.type}
                strokeWidth={1.75}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
                <Toast.Title className="font-medium text-foreground" />
                {item.description && (
                  <Toast.Description className="text-muted-foreground" />
                )}
              </div>
              {item.actionProps && (
                <Toast.Action className="shrink-0 self-center text-sm font-medium text-primary hover:underline">
                  Undo
                </Toast.Action>
              )}
              <Toast.Close
                aria-label="Dismiss"
                className="absolute top-3 right-3 text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                <X className="size-3.5" strokeWidth={1.75} />
              </Toast.Close>
            </Toast.Root>
          );
        })}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <ToastList />
    </Toast.Provider>
  );
}
