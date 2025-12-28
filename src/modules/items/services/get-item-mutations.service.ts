import { http } from "@/shared/infrastructure/http";
import {
  getMutationsResponse,
  type GetMutationsQuery,
} from "../schemas/get-item-mutations.schema";

/**
 * Fetches inventory mutations for a specific inventory.
 * @param token - Access token for authentication
 * @param inventoryId - The inventory ID to fetch mutations for
 * @param params - Optional query parameters (start_date, end_date, page, limit)
 * @returns Validated mutations response with data, metadata, and summary
 */
export async function getItemMutations(
  token: string,
  inventoryId: number,
  params?: GetMutationsQuery
) {
  const response = await http
    .get(`inventories/${inventoryId}/mutations`, {
      context: { token },
      searchParams: params as Record<string, string | number>,
    })
    .json();

  return getMutationsResponse.parse(response);
}
