import { http } from "@/shared/infrastructure/http";
import { type UpdateTradeInput, type Trade, tradeSchema } from "../schemas";

interface IUpdateTradeParams {
  token: string;
  id: number;
  data: UpdateTradeInput;
}

/**
 * Updates an existing trade.
 * @param params - Request parameters
 * @returns Validated updated trade
 */
export async function updateTrade(params: IUpdateTradeParams): Promise<Trade> {
  const { token, id, data } = params;
  const response = await http
    .patch(`trades/${id}`, {
      context: { token },
      json: data,
    })
    .json();
  return tradeSchema.parse(response);
}
