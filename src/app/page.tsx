import { redirect } from "next/navigation";
import { CreditCard, Landmark, Mail, Plane, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ConnectGmailButton } from "@/components/connect-gmail-button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BudgetCard } from "@/components/ui/budget-card";
import { TransactionRow } from "@/components/ui/transaction-row";
import { RecommendationCard } from "@/components/ui/recommendation-card";
import { InsightCard } from "@/components/ui/insight-card";

// Placeholder data only — no ingestion/budgeting/rewards module exists yet
// (ROADMAP.md M3-M8). Figures are fabricated but internally plausible for
// the Singapore-context PRD (PRODUCT.md §6.1, §6.5), so the visual design
// can be evaluated against a realistic content shape.
const RECENT_TRANSACTIONS = [
  {
    merchant: "Grab",
    category: "Transport",
    account: "UOB Preferred Platinum",
    amount: "-S$18.40",
    date: "Today",
    source: "imported" as const,
  },
  {
    merchant: "NTUC FairPrice",
    category: "Groceries",
    account: "OCBC 365 Account",
    amount: "-S$86.20",
    date: "Yesterday",
    source: "imported" as const,
  },
  {
    merchant: "Netflix",
    category: "Subscriptions",
    account: "DBS Woman's World",
    amount: "-S$16.98",
    date: "2 days ago",
    source: "imported" as const,
  },
  {
    merchant: "Din Tai Fung",
    category: "Dining",
    account: "Citi Rewards",
    amount: "-S$64.50",
    date: "3 days ago",
    source: "imported" as const,
  },
  {
    merchant: "Shopee",
    category: "Shopping",
    account: "DBS Altitude",
    amount: "-S$142.00",
    date: "4 days ago",
    source: "manual" as const,
  },
];

const BUDGET_CATEGORIES = [
  { category: "Shopping", spent: "S$524", limit: "S$500", percent: 105, status: "exceeded" as const },
  { category: "Dining", spent: "S$612", limit: "S$700", percent: 87, status: "warning" as const },
  { category: "Groceries", spent: "S$270", limit: "S$500", percent: 54, status: "on-track" as const },
];

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const session = await auth();

  // Defense in depth: this page must never render authenticated content
  // without a real session, regardless of whether src/proxy.ts ran or
  // behaved correctly upstream. `session.user` is only present on an
  // actual signed-in session, never on an error-shaped auth() result.
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const firstName = (session.user.name ?? session.user.email ?? "there").split(" ")[0];
  const greeting = getGreeting(new Date().getHours());

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              M
            </div>
            <span className="text-sm font-semibold tracking-tight">MilesOS</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-8 sm:py-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s where things stand today.
          </p>
        </div>

        {!session.gmailConnected && (
          <Card
            data-slot="gmail-connect-banner"
            className="flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <Mail className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium">Gmail isn&apos;t connected yet</p>
                <p className="text-sm text-muted-foreground">
                  Connect it to enable automatic transaction import — zero manual entry.
                </p>
              </div>
            </div>
            <ConnectGmailButton />
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <MetricCard
            className="sm:col-span-2"
            size="hero"
            label="Net Worth"
            value="S$142,918.20"
            icon={Wallet}
            accent="primary"
            trend={{ direction: "up", label: "Up 2.4% from last month" }}
          />
          <MetricCard
            label="Cash Available"
            value="S$24,650.30"
            icon={Landmark}
            accent="assets"
          />
          <MetricCard
            label="Credit Card Outstanding"
            value="-S$3,180.45"
            icon={CreditCard}
            accent="liabilities"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <MetricCard
            label="Miles Earned This Month"
            value="3,240 mi"
            icon={Plane}
            accent="rewards"
            trend={{ direction: "up", label: "Up 18% vs last month" }}
          />
          <RecommendationCard
            action="Use DBS Woman's World"
            reason="this is an online purchase and you still have S$240 of bonus spend remaining this month."
          />
        </div>

        <InsightCard
          type="Spending trend"
          title="Dining is running 32% above your 3-month average"
          preview="Mostly at Din Tai Fung and Ya Kun — S$210 more than a typical month so far."
        />

        <section className="flex flex-col gap-4">
          <SectionHeader title="Budgets" actionLabel="See all" actionHref="/budgets" />
          <Card className="gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">This month, overall</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                S$3,180 of S$4,500
              </span>
            </div>
            <ProgressBar value={70.7} />
          </Card>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {BUDGET_CATEGORIES.map((budget) => (
              <BudgetCard key={budget.category} {...budget} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader title="Recent Transactions" actionLabel="See all" actionHref="/transactions" />
          <Card className="gap-0 divide-y divide-border p-0">
            {RECENT_TRANSACTIONS.map((transaction) => (
              <TransactionRow key={`${transaction.merchant}-${transaction.date}`} {...transaction} />
            ))}
          </Card>
        </section>
      </main>
    </div>
  );
}
