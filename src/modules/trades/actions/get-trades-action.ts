"use server";

import { cookies } from "next/headers";
import { getManyTrades } from "../services";
import {
  type GetManyTradesQuery,
  type GetManyTradesResponse,
} from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch many trades with authentication.
 * @param params - Query parameters (spaceId, status, modelType, search, limit, page, sort, order)
 * @returns ActionResult with trades data or error message
 */
export async function getManyTradesAction(
  params?: GetManyTradesQuery
): Promise<ActionResult<GetManyTradesResponse>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await getManyTrades({
      token: accessToken,
      searchParams: params,
    });
    return { success: true, data };
  } catch (error) {
    console.log(error);
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to fetch trades",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
