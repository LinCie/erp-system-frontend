"use server";

import { cookies } from "next/headers";
import { deleteTrade } from "../services";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server action for deleting a trade.
 * @param id - Trade ID to delete
 * @returns ActionResult with success status or error message
 */
export async function deleteTradeAction(id: number): Promise<ActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    await deleteTrade({ token: accessToken, id });
    return { success: true, message: "Trade deleted successfully" };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to delete trade",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
