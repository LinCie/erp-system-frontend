"use server";

import { cookies } from "next/headers";
import { getOneTrade } from "../services";
import { type Trade } from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch a single trade by ID with authentication.
 * @param id - Trade ID
 * @returns ActionResult with trade data or error message
 */
export async function getTradeAction(id: number): Promise<ActionResult<Trade>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await getOneTrade({
      token: accessToken,
      id,
    });
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to fetch trade",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
