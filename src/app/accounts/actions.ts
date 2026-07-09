"use server";

import { revalidatePath } from "next/cache";
import { updateAccountBalance } from "@/lib/accounts";

export async function saveAccountBalance(
  accountId: string,
  newBalance: number,
): Promise<{ success: true } | { error: string }> {
  if (!Number.isFinite(newBalance)) {
    return { error: "Balance must be a valid number." };
  }

  try {
    await updateAccountBalance(accountId, newBalance);
    revalidatePath("/accounts");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
