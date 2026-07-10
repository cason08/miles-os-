"use client";

import { useState } from "react";
import { TransactionRow } from "@/components/ui/transaction-row";
import { TransactionCategoryPicker } from "@/components/transaction-category-picker";
import { TransactionRowActions } from "@/components/transaction-row-actions";
import { TransactionForm } from "@/components/transaction-form";
import type { TransactionRowData } from "@/lib/transactions";

// Per-row client wrapper: owns only this row's "am I being edited" state,
// so the surrounding TransactionList can stay a Server Component instead
// of lifting that state up to the whole list.
export function TransactionRowEditable({
  transaction,
  categories,
  accountOptions,
}: {
  transaction: TransactionRowData;
  categories: { id: string; name: string }[];
  accountOptions: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="p-4">
        <TransactionForm
          accountOptions={accountOptions}
          categories={categories}
          initial={{
            id: transaction.id,
            merchant: transaction.merchantRaw ?? "",
            amount: transaction.amountRaw,
            direction: transaction.direction,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            date: transaction.transactionDateRaw,
          }}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <TransactionRow
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
      actions={<TransactionRowActions transactionId={transaction.id} onEdit={() => setEditing(true)} />}
    />
  );
}
