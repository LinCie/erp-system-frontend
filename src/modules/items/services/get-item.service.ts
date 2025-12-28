import { http } from "@/shared/infrastructure/http";
import { GetItemQuery, Item, itemSchema } from "../schemas";

interface IGetOneItemParams {
  token: string;
  id: number;
  searchParams?: GetItemQuery;
}

export async function getOneItem(params: IGetOneItemParams): Promise<Item> {
  const { token, id, searchParams } = params;
  const response = await http
    .get(`items/${id}`, {
      context: { token },
      searchParams,
    })
    .json();
  return itemSchema.parse(response);
}
