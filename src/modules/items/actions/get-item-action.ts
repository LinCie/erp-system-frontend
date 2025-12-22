"use server";

import { cookies } from "next/headers";
import { itemsService } from "../services/items-service";
import { GetItemQuery, type Item } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch a single item by ID with authentication.
 * @param id - Item ID
 * @returns ActionResult with item data or error message
 */
export async function getItemAction(
  id: number,
  params?: GetItemQuery
): Promise<ActionResult<Item>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await itemsService.getItem(accessToken, id, params);
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to fetch item",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
