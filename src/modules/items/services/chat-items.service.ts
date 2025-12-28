import { http } from "@/shared/infrastructure/http";
import { ItemChatResponse, itemChatResponseSchema } from "../schemas";

interface ChatItemsParams {
  token: string;
  prompt: string;
}

/**
 * Sends a chat prompt about items to AI.
 * @param params - Request parameters containing token and prompt
 * @returns Validated AI response
 */
export async function chatWithItems(
  params: ChatItemsParams
): Promise<ItemChatResponse> {
  const { token, prompt } = params;
  const response = await http
    .post("items/chat", {
      context: { token },
      json: { prompt },
    })
    .json();
  return itemChatResponseSchema.parse(response);
}
