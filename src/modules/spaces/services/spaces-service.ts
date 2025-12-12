import { http } from "@/shared/infrastructure/http";
import {
  type GetSpacesParams,
  type Space,
  type SpaceListResponse,
  spaceListResponseSchema,
  spaceResponseSchema,
} from "../types/schemas";

/**
 * Spaces service for handling space-related API operations.
 * All API responses are validated against Zod schemas for type safety.
 */
export const spacesService = {
  /**
   * Fetches a list of spaces with optional filtering and pagination.
   * @param params - Optional query parameters for search, limit, and page
   * @returns Promise resolving to validated array of spaces
   * @throws HTTPError if the request fails
   * @example
   * ```typescript
   * const spaces = await spacesService.getSpaces({ search: "project", limit: 10 });
   * ```
   */
  async getSpaces(
    token: string,
    params?: GetSpacesParams
  ): Promise<SpaceListResponse> {
    const response = await http
      .get("spaces", {
        context: { token },
        searchParams: params,
      })
      .json();

    return spaceListResponseSchema.parse(response);
  },

  /**
   * Fetches a single space by ID.
   * @param token - Access token for authentication
   * @param spaceId - The space ID to fetch
   * @returns Promise resolving to validated space data
   * @throws HTTPError if the request fails
   */
  async getSpace(token: string, spaceId: number): Promise<Space> {
    const response = await http
      .get(`spaces/${spaceId}`, {
        context: { token },
      })
      .json();

    return spaceResponseSchema.parse(response).data;
  },
};
