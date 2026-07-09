import { CreditCard as CreditCardIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ProgressBar, type ProgressBarVariant } from "@/components/ui/progress-bar"

function CreditCardSummaryRow({
  name,
  outstanding,
  bonusLabel,
  bonusPercent,
  bonusVariant = "primary",
  className,
}: {
  name: string
  /** Pre-formatted, sign-and-currency included, e.g. "-S$1,940.15". */
  outstanding: string
  /** Pre-formatted, e.g. "S$1,760 of S$2,000 bonus cap". */
  bonusLabel: string
  /** 0-100+; drives the progress bar fill and the trailing percentage. */
  bonusPercent: number
  bonusVariant?: ProgressBarVariant
  className?: string
}) {
  return (
    <Card data-slot="credit-card-summary-row" className={cn("gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <CreditCardIcon className="size-4 shrink-0 text-liabilities" strokeWidth={1.75} />
          <span className="truncate">{name}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums">{outstanding}</span>
      </div>
      <ProgressBar value={bonusPercent} variant={bonusVariant} />
      <div className="flex items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
        <span className="truncate">{bonusLabel}</span>
        <span className="shrink-0">{Math.round(bonusPercent)}%</span>
      </div>
    </Card>
  )
}

export { CreditCardSummaryRow }
