import { http } from "@/shared/infrastructure/http";

interface DeleteItemParams {
  token: string;
  id: number;
}

/**
 * Deletes an item.
 * @param params - Request parameters containing token and item ID
 */
export async function deleteItem(params: DeleteItemParams): Promise<void> {
  const { token, id } = params;
  await http.delete(`items/${id}`, {
    context: { token },
  });
}
