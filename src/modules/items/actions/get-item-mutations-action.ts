"use server";

import { cookies } from "next/headers";
import { getItemMutations } from "../services/get-item-mutations.service";
import type { GetMutationsQuery } from "../schemas/get-item-mutations.schema";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import type { z } from "zod";
import type { getMutationsResponse } from "../schemas/get-item-mutations.schema";

type GetMutationsResponse = z.infer<typeof getMutationsResponse>;

/**
 * Server Action to fetch inventory mutations with authentication.
 * @param inventoryId - The inventory ID to fetch mutations for
 * @param params - Optional query parameters (start_date, end_date, page, limit)
 * @returns ActionResult with mutations data or error message
 */
export async function getItemMutationsAction(
  inventoryId: number,
  params?: GetMutationsQuery
): Promise<ActionResult<GetMutationsResponse>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await getItemMutations(accessToken, inventoryId, params);
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to fetch mutations",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
