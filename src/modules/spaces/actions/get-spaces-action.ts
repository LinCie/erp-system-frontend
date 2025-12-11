"use server";

import { cookies } from "next/headers";
import { spacesService } from "../services/spaces-service";
import { type GetSpacesParams, type SpaceListResponse } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch spaces with authentication.
 * Reads the access token from HTTP-only cookies server-side.
 * @param params - Optional query parameters for search, limit, and page
 * @returns Promise resolving to action result with spaces data or error message
 * @example
 * ```typescript
 * const result = await getSpacesAction({ search: "project", limit: 10 });
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export async function getSpacesAction(
  params?: GetSpacesParams
): Promise<ActionResult<SpaceListResponse>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await spacesService.getSpaces(accessToken, params);
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to fetch spaces",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
