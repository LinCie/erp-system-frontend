import { http } from "@/shared/infrastructure/http";
import { type Trade, tradeSchema } from "../schemas";

interface IGetOneTradeParams {
  token: string;
  id: number;
}

/**
 * Fetches a single trade by ID.
 * @param params - Request parameters
 * @returns Validated trade
 */
export async function getOneTrade(params: IGetOneTradeParams): Promise<Trade> {
  const { token, id } = params;
  const response = await http
    .get(`trades/${id}`, {
      context: { token },
    })
    .json();
  return tradeSchema.parse(response);
}
