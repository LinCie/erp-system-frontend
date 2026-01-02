"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { createTrade, getOneTrade } from "../services";
import { createTradeSchema, type Trade } from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib";

/**
 * Server action for creating a new trade.
 * @param spaceId - Space ID for the trade
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data
 * @returns ActionResult with created trade or validation errors
 */
export async function createTradeAction(
  spaceId: number,
  _prevState: ActionResult<Trade>,
  formData: FormData
): Promise<ActionResult<Trade>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  const senderIdValue = formData.get("sender_id");
  const rawData = {
    space_id: spaceId,
    sender_id: senderIdValue ? Number(senderIdValue) : null,
    sent_time: formData.get("sent_time") || undefined,
    sender_notes: formData.get("sender_notes") || undefined,
    number: formData.get("number") || undefined,
  };

  const parsed = createTradeSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(parsed.error),
    };
  }

  try {
    const trade = await createTrade({
      token: accessToken,
      data: parsed.data,
    });
    const data = await getOneTrade({
      token: accessToken,
      id: trade.id,
    });
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to create trade",
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
