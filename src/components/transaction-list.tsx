import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/components/ui/transaction-row";
import { TransactionCategoryPicker } from "@/components/transaction-category-picker";
import { TransactionRowEditable } from "@/components/transaction-row-editable";
import { AddTransactionControl } from "@/components/add-transaction-control";
import type { TransactionRowData } from "@/lib/transactions";
import type { CategoryData } from "@/lib/categories";

// Stays a Server Component -- editing/creating interactivity is isolated
// into small client leaf components (TransactionRowEditable,
// AddTransactionControl) rather than lifting state up into this list.
export function TransactionList({
  transactions,
  categories,
  editable = false,
  accountOptions = [],
  emptyMessage,
}: {
  transactions: TransactionRowData[];
  categories: CategoryData[];
  /** Enables Add/Edit/Delete -- true on /transactions, false (the default)
   * on Home's read-only Recent Transactions preview. */
  editable?: boolean;
  accountOptions?: { id: string; name: string }[];
  /** Overrides the default empty-state copy -- used by /transactions to
   * distinguish "no transactions match your filters" from "no transactions
   * at all." */
  emptyMessage?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {editable && <AddTransactionControl accountOptions={accountOptions} categories={categories} />}

      {transactions.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            {emptyMessage ??
              "No transactions yet — once Gmail sync captures a bank email, it'll show up here."}
          </p>
        </Card>
      ) : (
        <Card className="gap-0 divide-y divide-border p-0">
          {transactions.map((transaction) =>
            editable ? (
              <TransactionRowEditable
                key={transaction.id}
                transaction={transaction}
                categories={categories}
                accountOptions={accountOptions}
              />
            ) : (
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
            ),
          )}
        </Card>
      )}
    </div>
  );
}
