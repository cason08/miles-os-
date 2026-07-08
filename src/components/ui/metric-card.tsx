import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const ACCENT_STYLES = {
  primary: "text-primary",
  assets: "text-assets",
  liabilities: "text-liabilities",
  rewards: "text-rewards",
  neutral: "text-muted-foreground",
} as const

type MetricAccent = keyof typeof ACCENT_STYLES

const TREND_STYLES = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
} as const

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const

function MetricCard({
  label,
  value,
  accent = "neutral",
  size = "default",
  icon: Icon,
  trend,
  className,
}: {
  label: string
  value: string
  accent?: MetricAccent
  size?: "default" | "hero"
  icon?: LucideIcon
  trend?: { direction: "up" | "down" | "flat"; label: string }
  className?: string
}) {
  const TrendIcon = trend ? TREND_ICONS[trend.direction] : null

  return (
    <Card data-slot="metric-card" className={cn("gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <Icon className={cn("size-4", ACCENT_STYLES[accent])} strokeWidth={1.75} />
        )}
      </div>
      <div
        className={cn(
          "font-semibold tabular-nums",
          size === "hero" ? "text-4xl sm:text-5xl" : "text-3xl"
        )}
      >
        {value}
      </div>
      {trend && TrendIcon && (
        <div className={cn("flex items-center gap-1 text-sm", TREND_STYLES[trend.direction])}>
          <TrendIcon className="size-3.5" strokeWidth={1.75} />
          <span>{trend.label}</span>
        </div>
      )}
    </Card>
  )
}

export { MetricCard }
export type { MetricAccent }
