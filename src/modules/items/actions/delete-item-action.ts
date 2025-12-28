"use server";

import { cookies } from "next/headers";
import { deleteItem } from "../services";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server action for deleting an item.
 * @param id - Item ID to delete
 * @returns ActionResult with success status or error message
 */
export async function deleteItemAction(id: number): Promise<ActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    await deleteItem({ token: accessToken, id });
    return { success: true, message: "Item deleted successfully" };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to delete item",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
