import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"

function TransactionRow({
  merchant,
  category,
  account,
  amount,
  date,
  source,
  className,
}: {
  merchant: string
  category: string
  account: string
  /** Pre-formatted, sign-and-currency included, e.g. "-S$18.40" or "S$50.00". */
  amount: string
  date: string
  source: "imported" | "manual"
  className?: string
}) {
  const isCredit = !amount.trim().startsWith("-")

  return (
    <div
      data-slot="transaction-row"
      className={cn("flex items-center justify-between gap-4 p-4", className)}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{merchant}</span>
        <span className="truncate text-xs text-muted-foreground">
          {category} · {account} · {date}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge
          variant={source === "imported" ? "neutral" : "info"}
          className="hidden sm:inline-flex"
        >
          {source === "imported" ? "Imported" : "Manual"}
        </StatusBadge>
        <span
          className={cn(
            "text-right text-sm font-medium tabular-nums",
            isCredit && "text-success"
          )}
        >
          {amount}
        </span>
      </div>
    </div>
  )
}

export { TransactionRow }
