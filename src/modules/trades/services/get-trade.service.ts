import { http } from "@/shared/infrastructure/http";
import { GetTradeQuery, type Trade, tradeSchema } from "../schemas";

interface IGetOneTradeParams {
  token: string;
  id: number;
  searchParams?: GetTradeQuery;
}

/**
 * Fetches a single trade by ID.
 * @param params - Request parameters
 * @returns Validated trade
 */
export async function getOneTrade(params: IGetOneTradeParams): Promise<Trade> {
  const { token, id, searchParams } = params;

  const response = await http
    .get(`trades/${id}`, {
      context: { token },
      searchParams,
    })
    .json();
  return tradeSchema.parse(response);
}
