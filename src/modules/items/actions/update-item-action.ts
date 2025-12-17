"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { itemsService } from "../services/items-service";
import { type Item } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Zod schema for server-side validation (without File types).
 * All fields are optional for partial updates.
 * Files are handled separately via FormData.
 */
const updateItemServerSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  cost: z.string().min(1).optional(),
  price: z.string().min(1).optional(),
  weight: z.string().min(1).optional(),
  notes: z.string().optional(),
  space_id: z.number().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/**
 * Server action for updating an item.
 * Sends multipart/form-data to backend for image upload support.
 * @param id - Item ID to update
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data including images
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

  // Extract and validate non-file fields
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

  // Validate with Zod (non-file fields only)
  const result = updateItemServerSchema.safeParse(rawData);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    });
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  // Clean up FormData: remove empty file blobs and old keptImages format
  const cleanedFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    // Skip old keptImages format (we use existing_images now)
    if (key.startsWith("keptImages[")) {
      continue;
    }
    // Skip empty file blobs (size 0 or name 'blob')
    if (value instanceof File) {
      if (value.size > 0 && value.name !== "blob") {
        cleanedFormData.append(key, value);
      }
    } else {
      cleanedFormData.append(key, value);
    }
  }

  // Call service with cleaned FormData (includes images and keptImages)
  try {
    const item = await itemsService.updateItem(
      accessToken,
      id,
      cleanedFormData
    );
    return { success: true, data: item };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to update item",
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
