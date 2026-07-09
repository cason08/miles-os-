import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"

const ACCENT_STYLES = {
  assets: "text-assets",
  liabilities: "text-liabilities",
} as const

type BalanceGroupAccent = keyof typeof ACCENT_STYLES

function BalanceGroupRow({
  icon: Icon,
  accent,
  label,
  meta,
  amount,
  preview = false,
  className,
}: {
  icon: LucideIcon
  accent: BalanceGroupAccent
  label: string
  /** Secondary detail, e.g. "3 accounts" or "OA · SA · MA". */
  meta: string
  /** Pre-formatted, sign-and-currency included, e.g. "-S$3,180.45". */
  amount: string
  /** Marks a group not yet backed by a live data source. */
  preview?: boolean
  className?: string
}) {
  return (
    <div data-slot="balance-group-row" className={cn("flex items-center gap-3 py-2", className)}>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className={cn("size-4", ACCENT_STYLES[accent])} strokeWidth={1.75} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{label}</span>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs text-muted-foreground">{meta}</span>
          {preview && (
            <StatusBadge variant="neutral" className="shrink-0">
              Preview
            </StatusBadge>
          )}
        </div>
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums">{amount}</span>
    </div>
  )
}

export { BalanceGroupRow }
export type { BalanceGroupAccent }
