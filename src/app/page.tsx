import { redirect } from "next/navigation";
import {
  CreditCard,
  Landmark,
  LineChart,
  Mail,
  Package,
  Plane,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getRecentTransactionRows } from "@/lib/recent-transactions";
import { SignOutButton } from "@/components/sign-out-button";
import { ConnectGmailButton } from "@/components/connect-gmail-button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BudgetCard } from "@/components/ui/budget-card";
import { TransactionRow } from "@/components/ui/transaction-row";
import { InsightCard } from "@/components/ui/insight-card";
import { Collapsible } from "@/components/ui/collapsible";
import { BalanceGroupRow, type BalanceGroupAccent } from "@/components/ui/balance-group-row";
import { CreditCardSummaryRow } from "@/components/ui/credit-card-summary-row";

// Placeholder data only — Net Worth, Budgets, and the Credit Card/Rewards
// summaries aren't backed by real data yet (still need Account/Budget/
// Rewards models). Figures are fabricated but internally consistent (e.g.
// the two cards' outstanding balances sum to the "Credit cards" line in
// the Net Worth breakdown) so the layout can be judged against a realistic
// content shape. Recent Transactions below is real (Transaction Persistence
// is done) and no longer part of this placeholder set.
const BALANCE_GROUPS: {
  icon: typeof Landmark;
  accent: BalanceGroupAccent;
  label: string;
  meta: string;
  amount: string;
  preview?: boolean;
}[] = [
  { icon: Landmark, accent: "assets", label: "Cash accounts", meta: "3 accounts", amount: "S$24,650.30" },
  {
    icon: LineChart,
    accent: "assets",
    label: "Investment accounts",
    meta: "Mari Invest · 1 account",
    amount: "S$8,500.00",
    preview: true,
  },
  { icon: ShieldCheck, accent: "assets", label: "CPF", meta: "OA · SA · MA", amount: "S$112,648.35", preview: true },
  { icon: CreditCard, accent: "liabilities", label: "Credit cards", meta: "2 cards", amount: "-S$3,180.45" },
  { icon: Package, accent: "assets", label: "Other assets", meta: "1 item", amount: "S$300.00", preview: true },
];

const BUDGET_CATEGORIES = [
  { category: "Food", spent: "S$612", limit: "S$700", percent: 87, status: "warning" as const },
  { category: "Transport", spent: "S$186", limit: "S$300", percent: 62, status: "on-track" as const },
  { category: "Shopping", spent: "S$524", limit: "S$500", percent: 105, status: "exceeded" as const },
  { category: "Life & Entertainment", spent: "S$340", limit: "S$450", percent: 76, status: "on-track" as const },
];

const CREDIT_CARDS = [
  {
    name: "UOB Preferred Platinum Visa",
    outstanding: "-S$1,940.15",
    bonusLabel: "S$1,760 of S$2,000 bonus cap",
    bonusPercent: 88,
    bonusVariant: "warning" as const,
  },
  {
    name: "DBS Woman's World Mastercard",
    outstanding: "-S$1,240.30",
    bonusLabel: "S$240 of S$800 bonus cap",
    bonusPercent: 30,
    bonusVariant: "primary" as const,
  },
];

const INSIGHTS = [
  {
    type: "Spending trend",
    title: "Dining is running 32% above your 3-month average",
    preview: "Mostly at Din Tai Fung and Ya Kun — S$210 more than a typical month so far.",
  },
  {
    type: "Reward opportunity",
    title: "UOB card is 88% toward its bonus cap",
    preview: "Switch everyday spend to DBS Woman's World for the rest of the month.",
  },
  {
    type: "Budget observation",
    title: "Shopping has run over budget three months running",
    preview: "Worth raising the limit, or trimming discretionary buys.",
  },
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
  const recentTransactions = await getRecentTransactionRows();

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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr_1fr]">
          {/* Overview */}
          <div className="flex flex-col gap-8">
            <SectionHeader title="Overview" />

            <MetricCard
              size="hero"
              padding="spacious"
              className="gap-4"
              label="Net Worth"
              value="S$142,918.20"
              icon={Wallet}
              accent="primary"
              trend={{ direction: "up", label: "Up 2.4% from last month" }}
            >
              <Collapsible label="View Breakdown">
                <div className="flex flex-col divide-y divide-border">
                  {BALANCE_GROUPS.map((group) => (
                    <BalanceGroupRow key={group.label} {...group} />
                  ))}
                </div>
              </Collapsible>
            </MetricCard>

            <div className="flex flex-col gap-6">
              <MetricCard label="Available Cash" value="S$24,650.30" icon={Landmark} accent="assets" />
              <MetricCard label="Spent This Month" value="S$3,180.00" icon={Wallet} />
            </div>

            <div className="flex flex-col gap-3">
              {INSIGHTS.map((insight) => (
                <InsightCard key={insight.title} size="compact" {...insight} />
              ))}
            </div>
          </div>

          {/* This Month */}
          <div className="flex flex-col gap-6">
            <SectionHeader title="This Month" actionLabel="See all" actionHref="/budgets" />

            <Card className="gap-3">
              <span className="text-sm text-muted-foreground">Budget health, overall</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums">71%</span>
                <span className="text-sm text-muted-foreground">of monthly budget used</span>
              </div>
              <ProgressBar value={70.7} />
              <span className="text-xs tabular-nums text-muted-foreground">
                S$3,180 of S$4,500 · S$1,320 left
              </span>
            </Card>

            <div className="flex flex-col gap-4">
              {BUDGET_CATEGORIES.map((budget) => (
                <BudgetCard key={budget.category} {...budget} />
              ))}
            </div>
          </div>

          {/* Credit Cards */}
          <div className="flex flex-col gap-6">
            <SectionHeader title="Credit Cards" actionLabel="See all" actionHref="/wallet" />

            <div className="flex flex-col gap-6">
              <MetricCard label="Total Miles" value="182,450 mi" icon={Plane} accent="rewards" />
              <MetricCard
                label="Earned This Month"
                value="3,240 mi"
                icon={Plane}
                accent="rewards"
                trend={{ direction: "up", label: "Up 18% vs last month" }}
              />
            </div>

            <div className="flex flex-col gap-4">
              {CREDIT_CARDS.map((card) => (
                <CreditCardSummaryRow key={card.name} {...card} />
              ))}
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <SectionHeader title="Recent Transactions" actionLabel="See all" actionHref="/transactions" />
          {recentTransactions.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground">
                No transactions yet — once Gmail sync captures a bank email, it&apos;ll show up
                here.
              </p>
            </Card>
          ) : (
            <Card className="gap-0 divide-y divide-border p-0">
              {recentTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} {...transaction} />
              ))}
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
