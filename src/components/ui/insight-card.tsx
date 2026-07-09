import { ChevronRight, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"

function InsightCard({
  type,
  title,
  preview,
  size = "default",
  className,
}: {
  /** e.g. "Spending trend" */
  type: string
  title: string
  preview: string
  /** "compact" for stacking several (e.g. Home's up-to-three teaser list). */
  size?: "default" | "compact"
  className?: string
}) {
  const compact = size === "compact"

  return (
    <Card
      data-slot="insight-card"
      className={cn(
        "flex-row items-start justify-between gap-4",
        compact && "gap-3 p-4",
        className
      )}
    >
      <div className="flex min-w-0 gap-3">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <StatusBadge variant="info">{type}</StatusBadge>
          <p className="text-sm font-medium leading-snug">{title}</p>
          <p
            className={cn(
              "text-sm leading-snug text-muted-foreground",
              compact && "line-clamp-1"
            )}
          >
            {preview}
          </p>
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
