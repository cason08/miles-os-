import { cn } from "@/lib/utils"

const STATUS_STYLES = {
  success: "border-success/30 bg-success/15 text-success",
  warning: "border-warning/30 bg-warning/15 text-warning",
  error: "border-destructive/30 bg-destructive/15 text-destructive",
  info: "border-primary/30 bg-primary/15 text-primary",
  neutral: "border-border bg-muted text-muted-foreground",
} as const

type StatusBadgeVariant = keyof typeof STATUS_STYLES

function StatusBadge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: StatusBadgeVariant
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export { StatusBadge }
export type { StatusBadgeVariant }
