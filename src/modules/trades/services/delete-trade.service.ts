import { http } from "@/shared/infrastructure/http";

interface IDeleteTradeParams {
  token: string;
  id: number;
}

/**
 * Deletes a trade.
 * @param params - Request parameters containing token and trade ID
 */
export async function deleteTrade(params: IDeleteTradeParams): Promise<void> {
  const { token, id } = params;
  await http.delete(`trades/${id}`, {
    context: { token },
  });
}
