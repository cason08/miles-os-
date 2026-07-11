"use client";

import { useRef, useState } from "react";
import { deleteTransactionAction } from "@/app/transactions/actions";
import { TransactionRow } from "@/components/ui/transaction-row";
import { TransactionCategoryPicker } from "@/components/transaction-category-picker";
import { TransactionRowActions } from "@/components/transaction-row-actions";
import { TransactionForm } from "@/components/transaction-form";
import { toast } from "@/lib/toast";
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
  const [pendingDelete, setPendingDelete] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDelete() {
    setPendingDelete(true);
    // The actual server delete is delayed behind the undo window -- if the
    // user never clicks Undo, this fires and the row's removal becomes
    // permanent. Deliberately not cancelled on unmount: navigating away
    // during the window shouldn't cancel a delete the user already
    // committed to, matching Gmail's own behaviour.
    deleteTimer.current = setTimeout(async () => {
      const result = await deleteTransactionAction(transaction.id);
      if ("error" in result) {
        toast.error("Couldn't delete transaction", result.error);
        setPendingDelete(false);
      }
    }, 5000);

    toast.undo("Transaction deleted", () => {
      if (deleteTimer.current) clearTimeout(deleteTimer.current);
      setPendingDelete(false);
    });
  }

  if (pendingDelete) {
    return null;
  }

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
      actions={<TransactionRowActions onEdit={() => setEditing(true)} onDelete={handleDelete} />}
    />
  );
}
