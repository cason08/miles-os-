import { ChevronRight, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"

function InsightCard({
  type,
  title,
  preview,
  className,
}: {
  /** e.g. "Spending trend" */
  type: string
  title: string
  preview: string
  className?: string
}) {
  return (
    <Card
      data-slot="insight-card"
      className={cn("flex-row items-start justify-between gap-4", className)}
    >
      <div className="flex gap-3">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
        <div className="flex flex-col gap-1.5">
          <StatusBadge variant="info">{type}</StatusBadge>
          <p className="text-sm font-medium leading-snug">{title}</p>
          <p className="text-sm leading-snug text-muted-foreground">{preview}</p>
        </div>
      </div>
      <ChevronRight
        className="mt-1 size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
      />
    </Card>
  )
}

export { InsightCard }
