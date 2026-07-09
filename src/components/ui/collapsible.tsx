"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Collapsible({
  label,
  defaultOpen = false,
  className,
  children,
}: {
  label: string
  defaultOpen?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div data-slot="collapsible" className={cn("flex flex-col", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
      >
        <ChevronDown
          className={cn("size-4 transition-transform duration-200 ease-out", open && "rotate-180")}
          strokeWidth={1.75}
        />
        {label}
      </button>
      <div
        className="grid transition-all duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 flex flex-col border-t border-border pt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}

export { Collapsible }
