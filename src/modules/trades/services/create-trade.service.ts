import { http } from "@/shared/infrastructure/http";
import { type CreateTradeInput, type Trade, tradeSchema } from "../schemas";

interface ICreateTradeParams {
  token: string;
  data: CreateTradeInput;
}

/**
 * Creates a new trade.
 * @param params - Request parameters
 * @returns Validated created trade
 */
export async function createTrade(params: ICreateTradeParams): Promise<Trade> {
  const { token, data } = params;
  const response = await http
    .post("trades", {
      context: { token },
      json: data,
    })
    .json();
  return tradeSchema.parse(response);
}
