"use server";

import { revalidatePath } from "next/cache";
import { setTransactionCategory } from "@/lib/transactions";
import { createMerchantRule } from "@/lib/merchant-rules";

type ActionResult = { success: true } | { error: string };

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
