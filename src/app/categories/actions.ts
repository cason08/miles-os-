"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  updateCategory,
  setCategoryActive,
  deleteCategory,
  type CategoryInput,
} from "@/lib/categories";

type ActionResult = { success: true } | { error: string };

function validate(input: CategoryInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (input.budget != null && (!Number.isFinite(input.budget) || input.budget < 0)) {
    return "Budget must be a non-negative number, or left blank.";
  }
  if (!input.currency.trim()) return "Currency is required.";
  return null;
}

export async function createCategoryAction(input: CategoryInput): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await createCategory(input);
    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateCategoryAction(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await updateCategory(id, input);
    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function archiveCategoryAction(id: string): Promise<ActionResult> {
  try {
    await setCategoryActive(id, false);
    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await deleteCategory(id);
    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
