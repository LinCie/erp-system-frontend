import { http } from "@/shared/infrastructure/http";
import {
  itemSchema,
  getManyItemsPaginatedResponseSchema,
  itemChatResponseSchema,
  type Item,
  type GetManyItemsPaginatedResponse,
  type ItemChatResponse,
  type GetManyItemsParams,
} from "../types/schemas";

/**
 * Service for handling items API operations.
 * All responses are validated against Zod schemas.
 */
export const itemsService = {
  /**
   * Fetches many items with optional filtering and pagination.
   * @param token - Access token for authenticated requests
   * @param params - Query parameters (spaceId, type, search, limit, page)
   * @returns Validated list of items
   */
  async getManyItems(
    token: string,
    params: GetManyItemsParams
  ): Promise<GetManyItemsPaginatedResponse> {
    const response = await http
      .get("items", {
        context: { token },
        searchParams: params,
      })
      .json();
    return getManyItemsPaginatedResponseSchema.parse(response);
  },

  /**
   * Fetches a single item by ID.
   * @param token - Access token for authenticated requests
   * @param id - Item ID
   * @returns Validated item details
   */
  async getItem(token: string, id: number): Promise<Item> {
    const response = await http
      .get(`items/${id}`, {
        context: { token },
      })
      .json();
    return itemSchema.parse(response);
  },

  /**
   * Creates a new item using multipart/form-data.
   * @param token - Access token for authenticated requests
   * @param formData - FormData containing item fields and images
   * @returns Validated created item
   */
  async createItem(token: string, formData: FormData): Promise<Item> {
    const response = await http
      .post("items", {
        context: { token },
        body: formData,
      })
      .json();
    return itemSchema.parse(response);
  },

  /**
   * Updates an existing item using multipart/form-data.
   * @param token - Access token for authenticated requests
   * @param id - Item ID
   * @param formData - FormData containing item fields and images
   * @returns Validated updated item
   */
  async updateItem(
    token: string,
    id: number,
    formData: FormData
  ): Promise<Item> {
    const response = await http
      .patch(`items/${id}`, {
        context: { token },
        body: formData,
      })
      .json();
    return itemSchema.parse(response);
  },

  /**
   * Deletes an item.
   * @param token - Access token for authenticated requests
   * @param id - Item ID
   */
  async deleteItem(token: string, id: number): Promise<void> {
    await http.delete(`items/${id}`, {
      context: { token },
    });
  },

  /**
   * Sends a chat prompt about items to AI.
   * @param token - Access token for authenticated requests
   * @param prompt - Chat prompt
   * @returns Validated AI response
   */
  async chatWithItems(
    token: string,
    prompt: string
  ): Promise<ItemChatResponse> {
    const response = await http
      .post("items/chat", {
        context: { token },
        json: { prompt },
      })
      .json();
    return itemChatResponseSchema.parse(response);
  },
};
