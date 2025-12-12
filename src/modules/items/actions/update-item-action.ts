"use server";

import { cookies } from "next/headers";
import { itemsService } from "../services/items-service";
import { updateItemSchema, type Item } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib/validation";

/**
 * Server action for updating an item.
 * @param id - Item ID to update
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data
 * @returns ActionResult with updated item or validation errors
 */
export async function updateItemAction(
  id: number,
  _prevState: ActionResult<Item>,
  formData: FormData
): Promise<ActionResult<Item>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  // Extract form data
  const rawData = {
    name: formData.get("name") || undefined,
    sku: formData.get("sku") || undefined,
    price: formData.get("price") || undefined,
    cost: formData.get("cost") || undefined,
    weight: formData.get("weight") || undefined,
    status: formData.get("status") || undefined,
    description: formData.get("description") || undefined,
    notes: formData.get("notes") || undefined,
    space_id: formData.get("space_id")
      ? Number(formData.get("space_id"))
      : undefined,
  };

  // Validate with Zod
  const result = updateItemSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(result.error),
    };
  }

  // Call service
  try {
    const item = await itemsService.updateItem(accessToken, id, result.data);
    return { success: true, data: item };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to update item",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
