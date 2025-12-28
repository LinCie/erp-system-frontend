import { http } from "@/shared/infrastructure/http";
import { UpdateItemInput, Item, itemSchema } from "../schemas";

interface UpdateItemParams {
  token: string;
  id: number;
  data: UpdateItemInput;
}

export async function UpdateItem(params: UpdateItemParams): Promise<Item> {
  const { token, id, data } = params;

  const response = await http
    .patch(`/items/${id}`, {
      context: { token },
      body: JSON.stringify(data),
    })
    .json();

  return itemSchema.parse(response);
}
