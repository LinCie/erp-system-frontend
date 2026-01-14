import { http } from "@/shared/infrastructure/http";
import { type Trade, tradeSchema } from "../schemas";

interface IGetOneTradeParams {
  token: string;
  id: number;
  withChildren?: boolean;
}

/**
 * Fetches a single trade by ID.
 * @param params - Request parameters
 * @returns Validated trade
 */
export async function getOneTrade(params: IGetOneTradeParams): Promise<Trade> {
  const { token, id, withChildren } = params;
  const searchParams: Record<string, string> = {};

  if (withChildren) {
    searchParams.withChildren = "true";
  }

  const response = await http
    .get(`trades/${id}`, {
      context: { token },
      searchParams:
        Object.keys(searchParams).length > 0 ? searchParams : undefined,
    })
    .json();
  return tradeSchema.parse(response);
}
