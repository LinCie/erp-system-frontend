"use server";

import { cookies } from "next/headers";
import { spacesService } from "../services/spaces-service";
import { type Space } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch a single space by ID.
 * @param spaceId - The space ID to fetch
 * @returns ActionResult with space data or error message
 */
export async function getSpaceAction(
  spaceId: number
): Promise<ActionResult<Space>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await spacesService.getSpace(accessToken, spaceId);
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to fetch space",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
