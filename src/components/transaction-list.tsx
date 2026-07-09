import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/components/ui/transaction-row";
import type { TransactionRowData } from "@/lib/transactions";

export function TransactionList({ transactions }: { transactions: TransactionRowData[] }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          No transactions yet — once Gmail sync captures a bank email, it&apos;ll show up here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="gap-0 divide-y divide-border p-0">
      {transactions.map((transaction) => (
        <TransactionRow key={transaction.id} {...transaction} />
      ))}
    </Card>
  );
}
