import { http } from "@/shared/infrastructure/http";
import {
  type CreateTradeDetailInput,
  type TradeDetail,
  tradeDetailSchema,
} from "../schemas";

interface ICreateTradeDetailParams {
  token: string;
  tradeId: number;
  data: CreateTradeDetailInput;
}

/**
 * Creates a new trade detail line item.
 * @param params - Request parameters
 * @returns Validated created trade detail
 */
export async function createTradeDetail(
  params: ICreateTradeDetailParams
): Promise<TradeDetail> {
  const { token, tradeId, data } = params;
  const response = await http
    .post(`trades/${tradeId}/details`, {
      context: { token },
      json: data,
    })
    .json();
  return tradeDetailSchema.parse(response);
}
