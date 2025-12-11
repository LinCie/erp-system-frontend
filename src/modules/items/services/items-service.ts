import { http } from "@/shared/infrastructure/http";
import {
  itemSchema,
  itemPaginatedResponseSchema,
  itemChatResponseSchema,
  type Item,
  type ItemPaginatedResponse,
  type ItemChatResponse,
  type CreateItemInput,
  type UpdateItemInput,
  type GetItemsParams,
} from "../types/schemas";

/**
 * Service for handling items API operations.
 * All responses are validated against Zod schemas.
 */
export const itemsService = {
  /**
   * Fetches a list of items with optional filtering and pagination.
   * @param token - Access token for authenticated requests
   * @param params - Query parameters (spaceId, type, search, limit, page)
   * @returns Validated list of items
   */
  async getItems(
    token: string,
    params: GetItemsParams
  ): Promise<ItemPaginatedResponse> {
    const response = await http
      .get("items", {
        context: { token },
        searchParams: params,
      })
      .json();
    return itemPaginatedResponseSchema.parse(response);
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
   * Creates a new item.
   * @param token - Access token for authenticated requests
   * @param data - Item creation data
   * @returns Validated created item
   */
  async createItem(token: string, data: CreateItemInput): Promise<Item> {
    const response = await http
      .post("items", {
        context: { token },
        json: { ...data, spaceId: data.spaceId },
      })
      .json();
    return itemSchema.parse(response);
  },

  /**
   * Updates an existing item.
   * @param token - Access token for authenticated requests
   * @param id - Item ID
   * @param data - Item update data
   * @returns Validated updated item
   */
  async updateItem(
    token: string,
    id: number,
    data: UpdateItemInput
  ): Promise<Item> {
    const response = await http
      .patch(`items/${id}`, {
        context: { token },
        json: data,
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
