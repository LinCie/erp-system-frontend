import { z } from "zod";
import { entitySchema, paginationMetaSchema } from "@/shared/types";

// Re-export shared types for convenience
export {
  type ActionResult,
  initialActionState,
  type PaginationMeta,
  paginationMetaSchema,
  type PaginatedResponse,
  type ErrorResponse,
  errorResponseSchema,
  type Entity,
  entitySchema,
  type Status,
  statusSchema,
} from "@/shared/types";

/**
 * Item schemas
 */

export const itemSchema = entitySchema.extend({
  name: z.string(),
  price: z.coerce.number().nullable().optional(),
  sku: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const createItemSchema = z.object({
  name: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const updateItemSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const itemListResponseSchema = z.object({
  data: z.array(itemSchema),
  metadata: paginationMetaSchema,
});

export const itemPaginatedResponseSchema = itemListResponseSchema;

export const itemChatSchema = z.object({
  prompt: z.string(),
});

export const itemChatResponseSchema = z.object({
  response: z.string(),
});

/**
 * Query parameters
 */

export const getItemsQuerySchema = z.object({
  spaceId: z.number().optional(),
  type: z.enum(["full", "partial"]),
  search: z.string().optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
});

export const getItemsParamsSchema = getItemsQuerySchema;

/**
 * Inferred types
 */

export type Item = z.infer<typeof itemSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemListResponse = z.infer<typeof itemListResponseSchema>;
export type ItemPaginatedResponse = z.infer<typeof itemPaginatedResponseSchema>;
export type ItemChatInput = z.infer<typeof itemChatSchema>;
export type ItemChatResponse = z.infer<typeof itemChatResponseSchema>;
export type GetItemsQuery = z.infer<typeof getItemsQuerySchema>;
export type GetItemsParams = z.infer<typeof getItemsQuerySchema>;
