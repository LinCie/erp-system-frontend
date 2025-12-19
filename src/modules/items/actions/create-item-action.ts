"use server";

import type { ActionResult } from "@/shared/types/action-result";

import { cookies } from "next/headers";
import { z } from "zod";
import { mapZodErrors } from "@/shared/lib";
import { ApiError, isHttpError } from "@/shared/infrastructure/http";
import { itemsService } from "../services/items-service";
import { createItemSchema, type Item } from "../types/schemas";

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

  const imagesJson = formData.get("images");
  let images = undefined;
  if (imagesJson && typeof imagesJson === "string") {
    try {
      images = JSON.parse(imagesJson);
    } catch {
      // Invalid JSON, skip images
    }
  }

  const rawData = {
    name: formData.get("name"),
    cost: formData.get("cost"),
    price: formData.get("price"),
    weight: formData.get("weight"),
    status: formData.get("status"),
    space_id: formData.get("space_id")
      ? Number(formData.get("space_id"))
      : undefined,
    description: formData.get("description") || undefined,
    sku: formData.get("sku") || undefined,
    notes: formData.get("notes") || undefined,
    images,
  };

  const parsed = createItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(parsed.error),
    };
  }

  // Call service
  try {
    const item = await itemsService.createItem(accessToken, parsed.data);
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
