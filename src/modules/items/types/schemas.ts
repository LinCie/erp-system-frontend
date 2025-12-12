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
  code: z.string().nullish().optional(),
  description: z.string().nullish().optional(),
  sku: z.string().nullish().optional(),
  cost: z.string(),
  price: z.string(),
  weight: z.string(),
  notes: z.string().nullish().optional(),
  model_id: z.number().nullish().optional(),
  model_type: z.string().nullish().optional(),
  parent_id: z.number().nullish().optional(),
  parent_type: z.string().nullish().optional(),
  space_id: z.number().nullish().optional(),
  space_type: z.string().nullish().optional(),
  type_id: z.number().nullish().optional(),
  type_type: z.string().nullish().optional(),
  primary_code: z.string().nullish().optional(),
});

export const createItemSchema = z.object({
  name: z.string(),
  code: z.string().nullish().optional(),
  description: z.string().nullish().optional(),
  sku: z.string().nullish().optional(),
  cost: z.string(),
  price: z.string(),
  weight: z.string(),
  notes: z.string().nullish().optional(),
  model_id: z.number().nullish().optional(),
  model_type: z.string().nullish().optional(),
  parent_id: z.number().nullish().optional(),
  parent_type: z.string().nullish().optional(),
  space_id: z.number().nullish().optional(),
  space_type: z.string().nullish().optional(),
  type_id: z.number().nullish().optional(),
  type_type: z.string().nullish().optional(),
  primary_code: z.string().nullish().optional(),
  status: z.enum(["active", "inactive"]),
});

export const updateItemSchema = createItemSchema.partial();

export const getManyItemsResponseSchema = z.object({
  data: z.array(itemSchema),
  metadata: paginationMetaSchema,
});

export const getManyItemsPaginatedResponseSchema = getManyItemsResponseSchema;

export const itemChatSchema = z.object({
  prompt: z.string(),
});

export const itemChatResponseSchema = z.object({
  response: z.string(),
});

/**
 * Query parameters
 */

export const getManyItemsQuerySchema = z.object({
  spaceId: z.number().optional(),
  type: z.enum(["full", "partial"]),
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
});

export const getManyItemsParamsSchema = getManyItemsQuerySchema;

/**
 * Inferred types
 */

export type Item = z.infer<typeof itemSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type GetManyItemsResponse = z.infer<typeof getManyItemsResponseSchema>;
export type GetManyItemsPaginatedResponse = z.infer<
  typeof getManyItemsPaginatedResponseSchema
>;
export type ItemChatInput = z.infer<typeof itemChatSchema>;
export type ItemChatResponse = z.infer<typeof itemChatResponseSchema>;
export type GetManyItemsQuery = z.infer<typeof getManyItemsQuerySchema>;
export type GetManyItemsParams = z.infer<typeof getManyItemsParamsSchema>;
