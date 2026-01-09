import { http } from "@/shared/infrastructure/http";
import {
  type GetTradeItemsQuery,
  type GetTradeItemsResponse,
  getTradeItemsResponseSchema,
} from "../schemas";

interface IGetTradeItemsParams {
  token: string;
  searchParams?: GetTradeItemsQuery;
}

/**
 * Fetches items for trade detail selection.
 * @param params - Request parameters including token and search params
 * @returns Validated list of items
 */
export async function getTradeItems(
  params: IGetTradeItemsParams
): Promise<GetTradeItemsResponse> {
  const { token, searchParams } = params;
  const response = await http
    .get("items", {
      context: { token },
      searchParams: {
        ...searchParams,
        type: "partial",
      },
    })
    .json();
  return getTradeItemsResponseSchema.parse(response);
}
