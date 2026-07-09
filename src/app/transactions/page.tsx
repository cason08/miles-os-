import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTransactions } from "@/lib/transactions";
import { TransactionList } from "@/components/transaction-list";

export default async function TransactionsPage() {
  const session = await auth();

  // Defense in depth: this page must never render authenticated content
  // without a real session, regardless of whether src/proxy.ts ran or
  // behaved correctly upstream -- same pattern as src/app/page.tsx.
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const transactions = await getTransactions();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Transactions ({transactions.length})
          </h1>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to Home
          </Link>
        </div>

        <TransactionList transactions={transactions} />
      </main>
    </div>
  );
}
