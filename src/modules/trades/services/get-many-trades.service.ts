import { http } from "@/shared/infrastructure/http";
import {
  type GetManyTradesQuery,
  type GetManyTradesResponse,
  getManyTradesResponseSchema,
} from "../schemas";

interface IGetManyTradesParams {
  token: string;
  searchParams?: GetManyTradesQuery;
}

/**
 * Fetches many trades with optional filtering and pagination.
 * @param params - Request parameters
 * @returns Validated list of trades
 */
export async function getManyTrades(
  params: IGetManyTradesParams
): Promise<GetManyTradesResponse> {
  const { token, searchParams } = params;
  const response = await http
    .get("trades", {
      context: { token },
      searchParams,
    })
    .json();
  return getManyTradesResponseSchema.parse(response);
}
