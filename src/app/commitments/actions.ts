"use server";

import { revalidatePath } from "next/cache";
import {
  createCommitment,
  updateCommitment,
  deleteCommitment,
  type CommitmentInput,
} from "@/lib/commitments";

type ActionResult = { success: true } | { error: string };

function validate(input: CommitmentInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!Number.isFinite(input.expectedAmount) || input.expectedAmount <= 0) {
    return "Expected amount must be a positive number.";
  }
  if (!Number.isInteger(input.expectedDayOfMonth) || input.expectedDayOfMonth < 1 || input.expectedDayOfMonth > 31) {
    return "Expected day of month must be between 1 and 31.";
  }
  if (!Number.isInteger(input.dayTolerance) || input.dayTolerance < 0) {
    return "Day tolerance must be a non-negative whole number.";
  }
  if (!input.accountId) return "Paying account is required.";
  return null;
}

export async function createCommitmentAction(input: CommitmentInput): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await createCommitment(input);
    revalidatePath("/commitments");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateCommitmentAction(
  id: string,
  input: CommitmentInput,
): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await updateCommitment(id, input);
    revalidatePath("/commitments");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteCommitmentAction(id: string): Promise<ActionResult> {
  try {
    await deleteCommitment(id);
    revalidatePath("/commitments");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
