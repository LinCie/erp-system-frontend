import { http } from "@/shared/infrastructure/http";
import { CreateItemInput, Item, itemSchema } from "../schemas";

interface CreateItemParams {
  token: string;
  data: CreateItemInput;
}

export async function CreateItem(params: CreateItemParams): Promise<Item> {
  const { token, data } = params;

  const response = await http
    .post("items", {
      context: { token },
      body: JSON.stringify(data),
    })
    .json();

  return itemSchema.parse(response);
}
