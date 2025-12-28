import { http } from "@/shared/infrastructure/http";
import {
  GetManyItemsQuery,
  GetManyItemsResponse,
  getManyItemsResponseSchema,
} from "../schemas";

interface IGetManyItemsParams {
  token: string;
  searchParams: GetManyItemsQuery;
}

/**
 * Fetches many items with optional filtering and pagination.
 * @param params - Request parameters
 * @returns Validated list of items
 */
export async function getManyItems(
  params: IGetManyItemsParams
): Promise<GetManyItemsResponse> {
  const { token, searchParams } = params;
  const response = await http
    .get("items", {
      context: { token },
      searchParams,
    })
    .json();
  return getManyItemsResponseSchema.parse(response);
}
