import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ProgressBar, type ProgressBarVariant } from "@/components/ui/progress-bar"
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge"

type BudgetStatus = "on-track" | "warning" | "exceeded"

const STATUS_LABEL: Record<BudgetStatus, string> = {
  "on-track": "On track",
  warning: "Approaching limit",
  exceeded: "Exceeded",
}

const STATUS_VARIANT: Record<BudgetStatus, StatusBadgeVariant> = {
  "on-track": "success",
  warning: "warning",
  exceeded: "error",
}

const STATUS_PROGRESS_VARIANT: Record<BudgetStatus, ProgressBarVariant> = {
  "on-track": "success",
  warning: "warning",
  exceeded: "error",
}

function BudgetCard({
  category,
  spent,
  limit,
  percent,
  status,
  className,
}: {
  category: string
  /** Pre-formatted, currency included, e.g. "S$612". */
  spent: string
  /** Pre-formatted, currency included, e.g. "S$700". */
  limit: string
  /** spent / limit as a percentage; may exceed 100. */
  percent: number
  status: BudgetStatus
  className?: string
}) {
  return (
    <Card data-slot="budget-card" className={cn("gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{category}</span>
        <StatusBadge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</StatusBadge>
      </div>
      <ProgressBar value={percent} variant={STATUS_PROGRESS_VARIANT[status]} />
      <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>{spent} spent</span>
        <span>{limit} limit</span>
      </div>
    </Card>
  )
}

export { BudgetCard }
export type { BudgetStatus }
