import { http } from "@/shared/infrastructure/http";
import {
  type UpdateTradeDetailInput,
  type TradeDetail,
  tradeDetailSchema,
} from "../schemas";

interface IUpdateTradeDetailParams {
  token: string;
  tradeId: number;
  detailId: number;
  data: UpdateTradeDetailInput;
}

/**
 * Updates an existing trade detail line item.
 * Note: transaction_id, detail_type, and detail_id are immutable.
 * @param params - Request parameters
 * @returns Validated updated trade detail
 */
export async function updateTradeDetail(
  params: IUpdateTradeDetailParams
): Promise<TradeDetail> {
  const { token, tradeId, detailId, data } = params;
  const response = await http
    .patch(`trades/${tradeId}/details/${detailId}`, {
      context: { token },
      json: data,
    })
    .json();
  return tradeDetailSchema.parse(response);
}
