import { http } from "@/shared/infrastructure/http";

interface IDeleteTradeDetailParams {
  token: string;
  tradeId: number;
  detailId: number;
}

/**
 * Deletes a trade detail line item.
 * The detail must belong to the specified trade.
 * @param params - Request parameters
 */
export async function deleteTradeDetail(
  params: IDeleteTradeDetailParams
): Promise<void> {
  const { token, tradeId, detailId } = params;
  await http.delete(`trades/${tradeId}/details/${detailId}`, {
    context: { token },
  });
}
