"use server";

import { revalidatePath } from "next/cache";
import {
  setTransactionCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionInput,
} from "@/lib/transactions";
import { createMerchantRule } from "@/lib/merchant-rules";

type ActionResult = { success: true } | { error: string };

function revalidateTransactionPaths(): void {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/commitments");
}

function validateTransactionInput(input: TransactionInput): string | null {
  if (!input.merchant.trim()) return "Merchant / description is required.";
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return "Amount must be a positive number.";
  }
  if (input.direction !== "in" && input.direction !== "out") {
    return "Type must be Expense or Income.";
  }
  if (!input.date) return "Date is required.";
  return null;
}

export async function setTransactionCategoryAction(
  transactionId: string,
  categoryId: string | null,
): Promise<ActionResult> {
  try {
    await setTransactionCategory(transactionId, categoryId);
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function createMerchantRuleAction(
  categoryId: string,
  merchantPattern: string,
): Promise<ActionResult> {
  try {
    await createMerchantRule(categoryId, merchantPattern);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function createTransactionAction(input: TransactionInput): Promise<ActionResult> {
  const validationError = validateTransactionInput(input);
  if (validationError) return { error: validationError };

  try {
    await createTransaction(input);
    revalidateTransactionPaths();
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateTransactionAction(
  id: string,
  input: TransactionInput,
): Promise<ActionResult> {
  const validationError = validateTransactionInput(input);
  if (validationError) return { error: validationError };

  try {
    await updateTransaction(id, input);
    revalidateTransactionPaths();
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  try {
    await deleteTransaction(id);
    revalidateTransactionPaths();
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
