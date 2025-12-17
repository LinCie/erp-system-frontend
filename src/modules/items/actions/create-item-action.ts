"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { itemsService } from "../services/items-service";
import { type Item } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Zod schema for server-side validation (without File types).
 * Files are handled separately via FormData.
 */
const createItemServerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  cost: z.string().min(1, "Cost is required"),
  price: z.string().min(1, "Price is required"),
  weight: z.string().min(1, "Weight is required"),
  notes: z.string().optional(),
  space_id: z.number().optional(),
  status: z.enum(["active", "inactive"]),
});

/**
 * Server action for creating a new item.
 * Sends multipart/form-data to backend for image upload support.
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data including images
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

  // Extract and validate non-file fields
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

  // Validate with Zod (non-file fields only)
  const result = createItemServerSchema.safeParse(rawData);
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

  // Clean up FormData: remove empty file blobs
  const cleanedFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    // Skip empty file blobs (size 0 or name 'blob')
    if (value instanceof File) {
      if (value.size > 0 && value.name !== "blob") {
        cleanedFormData.append(key, value);
      }
    } else {
      cleanedFormData.append(key, value);
    }
  }

  // Call service with cleaned FormData (includes images)
  try {
    const item = await itemsService.createItem(accessToken, cleanedFormData);
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
