import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getTransactions,
  getTransactionCount,
  type TransactionFilters,
  type TransactionSort,
} from "@/lib/transactions";
import { getCategories } from "@/lib/categories";
import { getAccounts } from "@/lib/accounts";
import { TransactionList } from "@/components/transaction-list";
import { TransactionFilterToolbar } from "@/components/transaction-filter-toolbar";

function paramValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  // Defense in depth: this page must never render authenticated content
  // without a real session, regardless of whether src/proxy.ts ran or
  // behaved correctly upstream -- same pattern as src/app/page.tsx.
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const params = await searchParams;
  const filters: TransactionFilters = {
    search: paramValue(params, "q"),
    accountId: paramValue(params, "accountId"),
    categoryId: paramValue(params, "categoryId"),
    range: paramValue(params, "range") as TransactionFilters["range"],
    customFrom: paramValue(params, "from"),
    customTo: paramValue(params, "to"),
    type: paramValue(params, "type") as TransactionFilters["type"],
    source: paramValue(params, "source") as TransactionFilters["source"],
  };
  const sort = (paramValue(params, "sort") ?? "newest") as TransactionSort;

  const [transactions, totalCount, categories, accounts] = await Promise.all([
    getTransactions({ filters, sort }),
    getTransactionCount(),
    getCategories(),
    getAccounts(),
  ]);
  const accountOptions = accounts.map((account) => ({ id: account.id, name: account.name }));

  // Distinguishes "you have no transactions at all" from "none match your
  // current filters" -- the same empty Card would otherwise show a
  // misleading "connect Gmail" message when the real reason is a filter.
  const emptyMessage =
    transactions.length === 0 && totalCount > 0
      ? "No transactions match your filters. Try adjusting or clearing them."
      : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to Home
          </Link>
        </div>

        <TransactionFilterToolbar accountOptions={accountOptions} categories={categories} />

        <p className="text-sm text-muted-foreground">
          Showing {transactions.length} of {totalCount} transactions
        </p>

        <TransactionList
          transactions={transactions}
          categories={categories}
          editable
          accountOptions={accountOptions}
          emptyMessage={emptyMessage}
        />
      </main>
    </div>
  );
}
