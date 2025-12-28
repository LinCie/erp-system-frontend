"use server";

import { cookies } from "next/headers";
import { chatWithItems } from "../services";
import { itemChatSchema, type ItemChatResponse } from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib/validation";

/**
 * Server action for chatting with AI about items.
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data containing the prompt
 * @returns ActionResult with AI response or validation errors
 */
export async function chatItemsAction(
  _prevState: ActionResult<ItemChatResponse>,
  formData: FormData
): Promise<ActionResult<ItemChatResponse>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  // Extract form data
  const rawData = {
    prompt: formData.get("prompt"),
  };

  // Validate with Zod
  const result = itemChatSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(result.error),
    };
  }

  // Call service
  try {
    const response = await chatWithItems({
      token: accessToken,
      prompt: result.data.prompt,
    });
    return { success: true, data: response };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to get AI response",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
