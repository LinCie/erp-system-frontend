"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { getOneTrade } from "../services";
import { GetTradeQuery, type Trade } from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Internal cached function to fetch trade data.
 * Uses React cache to dedupe calls within the same request.
 */
const getCachedTrade = cache(
  async (
    id: number,
    accessToken: string,
    searchParams?: GetTradeQuery
  ): Promise<ActionResult<Trade>> => {
    try {
      const data = await getOneTrade({
        token: accessToken,
        id,
        searchParams,
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
);

/**
 * Server Action to fetch a single trade by ID with authentication.
 * @param id - Trade ID
 * @returns ActionResult with trade data or error message
 */
export async function getTradeAction(
  id: number,
  searchParams?: GetTradeQuery
): Promise<ActionResult<Trade>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  return getCachedTrade(id, accessToken, searchParams);
}
