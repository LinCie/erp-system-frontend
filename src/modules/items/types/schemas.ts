import { z } from "zod";
import { paginationMetaSchema, paginationParamsSchema } from "@/shared/types";
import { entitySchema, statusSchema } from "@/shared/types/entity-schema";

/**
 * Item response schema
 */
export const itemSchema = entitySchema.extend({
  sku: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  notes: z.string().nullable().optional(),
});
export type Item = z.infer<typeof itemSchema>;

/**
 * Item paginated response schema
 */
export const itemPaginatedResponseSchema = z.object({
  data: z.array(itemSchema),
  metadata: paginationMetaSchema,
});
export type ItemPaginatedResponse = z.infer<typeof itemPaginatedResponseSchema>;

/**
 * Create item request schema
 */
export const createItemSchema = z.object({
  spaceId: z.number(),
  sku: z.string(),
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number(),
  notes: z.string().nullable().optional(),
  status: statusSchema,
});
export type CreateItemInput = z.infer<typeof createItemSchema>;

/**
 * Update item request schema
 */
export const updateItemSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  status: statusSchema.optional(),
});
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

/**
 * Get items query parameters schema
 */
export const getItemsParamsSchema = paginationParamsSchema.extend({
  spaceId: z.number().optional(),
  type: z.enum(["full", "partial"]),
});
export type GetItemsParams = z.infer<typeof getItemsParamsSchema>;

/**
 * Item chat request schema
 */
export const itemChatSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});
export type ItemChatInput = z.infer<typeof itemChatSchema>;

/**
 * Item chat response schema
 */
export const itemChatResponseSchema = z.object({
  response: z.string(),
});
export type ItemChatResponse = z.infer<typeof itemChatResponseSchema>;
