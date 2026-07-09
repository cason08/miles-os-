import { redirect } from "next/navigation";
import {
  CreditCard,
  Landmark,
  LineChart,
  Mail,
  Plane,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getTransactions } from "@/lib/transactions";
import { getSpentThisMonth } from "@/lib/spent-this-month";
import { getAvailableCash, getNetWorth, getNetWorthBreakdown } from "@/lib/accounts";
import {
  getCommitmentsWithStatus,
  getProjectedAvailableCash,
  type CommitmentStatus,
} from "@/lib/commitments";
import { getLastSyncedAt } from "@/lib/daily-sync";
import { SignOutButton } from "@/components/sign-out-button";
import { ConnectGmailButton } from "@/components/connect-gmail-button";
import { SyncGmailControl } from "@/components/sync-gmail-control";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BudgetCard } from "@/components/ui/budget-card";
import { TransactionList } from "@/components/transaction-list";
import { InsightCard } from "@/components/ui/insight-card";
import { Collapsible } from "@/components/ui/collapsible";
import { BalanceGroupRow, type BalanceGroupAccent } from "@/components/ui/balance-group-row";
import { CreditCardSummaryRow } from "@/components/ui/credit-card-summary-row";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";

// Placeholder data only — Budgets and the Credit Card/Rewards miles
// summaries aren't backed by real data yet (still need Budget/Rewards
// models). Net Worth's breakdown is real (Account model); Recent
// Transactions is real (Transaction Persistence) -- neither is part of
// this placeholder set.
const BALANCE_GROUP_ICONS: Record<string, typeof Landmark> = {
  "Available Cash": Landmark,
  Investments: LineChart,
  "Credit Cards": CreditCard,
};
const BALANCE_GROUP_ACCENTS: Record<string, BalanceGroupAccent> = {
  "Available Cash": "assets",
  Investments: "assets",
  "Credit Cards": "liabilities",
};

const COMMITMENT_STATUS_LABEL: Record<CommitmentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};
const COMMITMENT_STATUS_VARIANT: Record<CommitmentStatus, StatusBadgeVariant> = {
  paid: "success",
  pending: "neutral",
  overdue: "error",
};

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

function formatLastSynced(date: Date | null): string {
  if (!date) return "Never synced yet";
  return date.toLocaleString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  const recentTransactions = await getTransactions(10);
  const spentThisMonth = await getSpentThisMonth();
  const availableCash = await getAvailableCash();
  const netWorth = await getNetWorth();
  const netWorthBreakdown = await getNetWorthBreakdown();
  const projectedAvailableCash = await getProjectedAvailableCash();
  const commitmentsWithStatus = await getCommitmentsWithStatus();
  const remainingCommitments = commitmentsWithStatus.filter(
    (commitment) => commitment.status !== "paid",
  );
  const totalMonthlyCommitments = remainingCommitments.reduce(
    (sum, commitment) => sum + commitment.expectedAmount,
    0,
  );
  const lastSyncedAt = await getLastSyncedAt();
  // Sign before the currency symbol (e.g. "-S$1,500.00") -- toLocaleString
  // alone would put it after ("S$-1,500.00"), which reads wrong. Needed
  // now that the Credit Cards breakdown section is a negative total.
  const formatSgd = (n: number) => {
    const sign = n < 0 ? "-" : "";
    const value = Math.abs(n).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}S$${value}`;
  };

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

        {!session.gmailConnected ? (
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
        ) : (
          <Card data-slot="gmail-sync-banner">
            <SyncGmailControl lastSyncedLabel={formatLastSynced(lastSyncedAt)} />
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
              value={formatSgd(netWorth)}
              icon={Wallet}
              accent="primary"
            >
              <Collapsible label="View Breakdown">
                <div className="flex flex-col gap-4">
                  {netWorthBreakdown.map((group) => (
                    <div key={group.label} className="flex flex-col">
                      <BalanceGroupRow
                        icon={BALANCE_GROUP_ICONS[group.label] ?? Landmark}
                        accent={BALANCE_GROUP_ACCENTS[group.label] ?? "assets"}
                        label={group.label}
                        meta={`${group.accounts.length} account${group.accounts.length === 1 ? "" : "s"}`}
                        amount={formatSgd(group.total)}
                      />
                      <div className="flex flex-col divide-y divide-border/50 pl-10">
                        {group.accounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between py-1.5 text-sm"
                          >
                            <span className="truncate text-muted-foreground">{account.name}</span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              {formatSgd(account.balance)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
            </MetricCard>

            <div className="flex flex-col gap-6">
              <MetricCard
                label="Available Cash"
                value={formatSgd(availableCash)}
                icon={Landmark}
                accent="assets"
              />
              <MetricCard
                label="Projected Available Cash"
                value={formatSgd(projectedAvailableCash)}
                icon={TrendingUp}
              >
                <Collapsible label="View Details">
                  {remainingCommitments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Every commitment is accounted for this month.
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex flex-col divide-y divide-border/50">
                        {remainingCommitments.map((commitment) => (
                          <div
                            key={commitment.id}
                            className="flex items-center justify-between gap-3 py-1.5 text-sm"
                          >
                            <span className="truncate text-muted-foreground">
                              {commitment.name}
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                              <StatusBadge variant={COMMITMENT_STATUS_VARIANT[commitment.status]}>
                                {COMMITMENT_STATUS_LABEL[commitment.status]}
                              </StatusBadge>
                              <span className="tabular-nums text-muted-foreground">
                                {formatSgd(commitment.expectedAmount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm">
                        <span className="font-semibold">Total Monthly Commitments</span>
                        <span className="font-semibold tabular-nums">
                          {formatSgd(totalMonthlyCommitments)}
                        </span>
                      </div>
                    </div>
                  )}
                </Collapsible>
              </MetricCard>
              <MetricCard label="Spent This Month" value={formatSgd(spentThisMonth)} icon={Wallet} />
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
          <TransactionList transactions={recentTransactions} />
        </section>
      </main>
    </div>
  );
}
