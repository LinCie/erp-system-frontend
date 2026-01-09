import { http } from "@/shared/infrastructure/http";
import {
  type GetTradeContactsQuery,
  type GetTradeContactsResponse,
  getTradeContactsResponseSchema,
} from "../schemas";

interface IGetTradeContactsParams {
  token: string;
  searchParams?: GetTradeContactsQuery;
}

/**
 * Fetches many trades with optional filtering and pagination.
 * @param params - Request parameters
 * @returns Validated list of trades
 */
export async function getTradeContacts(
  params: IGetTradeContactsParams
): Promise<GetTradeContactsResponse> {
  const { token, searchParams } = params;
  const response = await http
    .get("contacts", {
      context: { token },
      searchParams,
    })
    .json();
  return getTradeContactsResponseSchema.parse(response);
}
