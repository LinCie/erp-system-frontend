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

export const requestUploadBodySchema = z.object({
  contentType: z.string(),
  size: z.number(),
});

export type RequestUploadBody = z.infer<typeof requestUploadBodySchema>;

export const requestUploadResponseSchema = z.object({
  url: z.string(),
  key: z.string(),
});

export const itemFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
});

export const itemImageSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
  isNew: z.boolean().optional(),
});

export const itemSchema = entitySchema.extend({
  name: z.string(),
  cost: z.string(),
  price: z.string(),
  weight: z.string(),
  price_discount: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  notes: z.string().optional(),
  space_id: z.number().optional(),
  images: z.array(itemImageSchema).optional(),
  files: z.array(itemFileSchema).optional(),
});

export const createItemSchema = itemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
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

export type ItemFile = z.infer<typeof itemFileSchema>;
export type ItemImage = z.infer<typeof itemImageSchema>;
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
export type RequestUploadResponse = z.infer<typeof requestUploadResponseSchema>;
