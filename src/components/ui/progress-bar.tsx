import { cn } from "@/lib/utils"

const PROGRESS_STYLES = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
} as const

type ProgressBarVariant = keyof typeof PROGRESS_STYLES

function ProgressBar({
  value,
  variant = "primary",
  className,
}: {
  /** 0-100+; values above 100 still render a full track (the number label carries the overage). */
  value: number
  variant?: ProgressBarVariant
  className?: string
}) {
  const fill = Math.min(Math.max(value, 0), 100)

  return (
    <div
      data-slot="progress-bar"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          PROGRESS_STYLES[variant]
        )}
        style={{ width: `${fill}%` }}
      />
    </div>
  )
}

export { ProgressBar }
export type { ProgressBarVariant }
