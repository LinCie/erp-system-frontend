"use server";

import { cookies } from "next/headers";
import { getTradeItems } from "../services";
import {
  type GetTradeItemsQuery,
  type GetTradeItemsResponse,
} from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch items for trade detail selection.
 * @param params - Query parameters (spaceId, search, status, limit, page)
 * @returns ActionResult with items data or error message
 */
export async function getTradeItemsAction(
  params?: GetTradeItemsQuery
): Promise<ActionResult<GetTradeItemsResponse>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await getTradeItems({
      token: accessToken,
      searchParams: params,
    });
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to fetch items",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
