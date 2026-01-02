"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { updateTrade, getOneTrade } from "../services";
import { updateTradeSchema, type Trade } from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib";

/**
 * Server action for updating a trade.
 * @param id - Trade ID to update
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data
 * @returns ActionResult with updated trade or validation errors
 */
export async function updateTradeAction(
  id: number,
  _prevState: ActionResult<Trade>,
  formData: FormData
): Promise<ActionResult<Trade>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  // Parse JSON fields
  const filesJson = formData.get("files");
  let files = undefined;
  if (filesJson && typeof filesJson === "string") {
    try {
      files = JSON.parse(filesJson);
    } catch {
      // Invalid JSON, skip files
    }
  }

  const tagsJson = formData.get("tags");
  let tags = undefined;
  if (tagsJson && typeof tagsJson === "string") {
    try {
      tags = JSON.parse(tagsJson);
    } catch {
      // Invalid JSON, skip tags
    }
  }

  const linksJson = formData.get("links");
  let links = undefined;
  if (linksJson && typeof linksJson === "string") {
    try {
      links = JSON.parse(linksJson);
    } catch {
      // Invalid JSON, skip links
    }
  }

  const detailsJson = formData.get("details");
  let details = undefined;
  if (detailsJson && typeof detailsJson === "string") {
    try {
      details = JSON.parse(detailsJson);
    } catch {
      // Invalid JSON, skip details
    }
  }

  const handlerIdValue = formData.get("handler_id");
  const receiverIdValue = formData.get("receiver_id");
  const parentIdValue = formData.get("parent_id");

  const rawData = {
    handler_id: handlerIdValue ? Number(handlerIdValue) : null,
    sent_time: formData.get("sent_time") || undefined,
    received_time: formData.get("received_time") || undefined,
    receiver_id: receiverIdValue ? Number(receiverIdValue) : undefined,
    receiver_notes: formData.get("receiver_notes") || undefined,
    handler_notes: formData.get("handler_notes") || undefined,
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    parent_id: parentIdValue ? Number(parentIdValue) : undefined,
    files,
    tags,
    links,
    details,
  };

  const parsed = updateTradeSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(parsed.error),
    };
  }

  try {
    const trade = await updateTrade({
      token: accessToken,
      id,
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
        message: apiError.apiMessage ?? "Failed to update trade",
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
