import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAccounts, ACCOUNT_TYPE_LABELS } from "@/lib/accounts";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { AccountBalanceEditor } from "@/components/account-balance-editor";

export default async function AccountsPage() {
  const session = await auth();

  // Defense in depth -- same pattern as src/app/page.tsx.
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const accounts = await getAccounts();

  const groups = new Map<string, typeof accounts>();
  for (const account of accounts) {
    const existing = groups.get(account.type) ?? [];
    existing.push(account);
    groups.set(account.type, existing);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to Home
          </Link>
        </div>

        {accounts.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">No accounts yet.</p>
          </Card>
        ) : (
          Array.from(groups.entries()).map(([type, groupAccounts]) => (
            <section key={type} className="flex flex-col gap-4">
              <SectionHeader title={ACCOUNT_TYPE_LABELS[type] ?? type} />
              <Card className="gap-0 divide-y divide-border p-0">
                {groupAccounts.map((account) => (
                  <AccountBalanceEditor key={account.id} account={account} />
                ))}
              </Card>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
