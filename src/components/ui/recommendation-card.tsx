import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

function RecommendationCard({
  action,
  reason,
  className,
}: {
  /** e.g. "Use DBS Woman's World" */
  action: string
  /** e.g. "this is an online purchase and you still have S$240 of bonus spend remaining this month." */
  reason: string
  className?: string
}) {
  return (
    <Card
      data-slot="recommendation-card"
      className={cn("gap-2 border-l-2 border-l-primary", className)}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-primary" strokeWidth={1.75} />
        Recommended card
      </div>
      <p className="text-sm leading-snug">
        <span className="font-medium">{action}</span>{" "}
        <span className="text-muted-foreground">— {reason}</span>
      </p>
    </Card>
  )
}

export { RecommendationCard }
