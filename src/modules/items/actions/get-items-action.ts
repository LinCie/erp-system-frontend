"use server";

import { cookies } from "next/headers";
import { getManyItems } from "../services";
import { type GetManyItemsQuery, type GetManyItemsResponse } from "../schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch many items with authentication.
 * @param params - Query parameters (spaceId, type, search, limit, page)
 * @returns ActionResult with items data or error message
 */
export async function getManyItemsAction(
  params: GetManyItemsQuery
): Promise<ActionResult<GetManyItemsResponse>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await getManyItems({
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
