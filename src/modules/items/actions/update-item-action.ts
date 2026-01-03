"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { UpdateItem, getOneItem } from "../services";
import { updateItemSchema, type Item } from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib";

/**
 * Server action for updating an item.
 * Sends multipart/form-data to backend for image upload support.
 * @param id - Item ID to update
 * @param spaceId - Space ID for the item
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data
 * @returns ActionResult with updated item or validation errors
 */
export async function updateItemAction(
  id: number,
  spaceId: number,
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

  const filesJson = formData.get("files");
  let files = undefined;
  if (filesJson && typeof filesJson === "string") {
    try {
      files = JSON.parse(filesJson);
    } catch {
      // Invalid JSON, skip files
    }
  }

  const rawData = {
    name: formData.get("name") || undefined,
    cost: formData.get("cost") || undefined,
    price: formData.get("price") || undefined,
    price_discount: formData.get("price_discount") || undefined,
    weight: formData.get("weight") || undefined,
    status: formData.get("status") || undefined,
    space_id: spaceId,
    code: formData.get("code") || undefined,
    description: formData.get("description") || undefined,
    sku: formData.get("sku") || undefined,
    notes: formData.get("notes") || undefined,
    images: images || [],
    files: files || [],
  };

  const parsed = updateItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(parsed.error),
    };
  }

  // Call service
  try {
    const item = await UpdateItem({
      token: accessToken,
      id,
      data: parsed.data,
    });
    const data = await getOneItem({
      token: accessToken,
      id: item.id,
      searchParams: { withInventory: true },
    });
    return { success: true, data };
  } catch (error) {
    console.log(error);
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
