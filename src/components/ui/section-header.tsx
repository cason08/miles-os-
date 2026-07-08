import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function SectionHeader({
  title,
  actionLabel,
  actionHref,
  className,
}: {
  title: string
  actionLabel?: string
  actionHref?: string
  className?: string
}) {
  return (
    <div
      data-slot="section-header"
      className={cn("flex items-center justify-between", className)}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-0.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
        >
          {actionLabel}
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  )
}

export { SectionHeader }
