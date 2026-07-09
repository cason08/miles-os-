import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/components/ui/transaction-row";
import { TransactionCategoryPicker } from "@/components/transaction-category-picker";
import type { TransactionRowData } from "@/lib/transactions";
import type { CategoryData } from "@/lib/categories";

export function TransactionList({
  transactions,
  categories,
}: {
  transactions: TransactionRowData[];
  categories: CategoryData[];
}) {
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
        <TransactionRow
          key={transaction.id}
          merchant={transaction.merchant}
          account={transaction.account}
          amount={transaction.amount}
          date={transaction.date}
          source={transaction.source}
          categoryPicker={
            <TransactionCategoryPicker
              transactionId={transaction.id}
              merchant={transaction.merchant}
              categoryId={transaction.categoryId}
              categories={categories}
            />
          }
        />
      ))}
    </Card>
  );
}
