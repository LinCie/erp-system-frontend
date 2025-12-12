"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { itemsService } from "../services/items-service";
import { createItemSchema, type Item } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib/validation";

/**
 * Server action for creating a new item.
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data
 * @returns ActionResult with created item or validation errors
 */
export async function createItemAction(
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
    space_id: formData.get("space_id")
      ? Number(formData.get("space_id"))
      : undefined,
    sku: formData.get("sku") || undefined,
    name: formData.get("name"),
    price: formData.get("price"),
    cost: formData.get("cost"),
    weight: formData.get("weight"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
    description: formData.get("description") || undefined,
  };

  // Validate with Zod
  const result = createItemSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(result.error),
    };
  }

  // Call service
  try {
    const item = await itemsService.createItem(accessToken, result.data);
    return { success: true, data: item };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to create item",
      };
    }
    if (error instanceof z.ZodError) {
      console.error("Response validation error:", error.issues);
      return {
        success: false,
        message: "Invalid response from server",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
