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
 * Space schemas
 */

export const addressSchema = z
  .object({
    detail: z.string().nullable().optional(),
  })
  .nullable();

export const spaceSchema = entitySchema.extend({
  name: z.string(),
  code: z.string(),
});

export const createSpaceSchema = z.object({
  name: z.string(),
  code: z.string(),
  address: addressSchema,
  status: z.enum(["active", "inactive"]),
  notes: z.string().nullable().optional(),
});

export const updateSpaceSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  address: addressSchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  notes: z.string().nullable().optional(),
});

export const spaceListResponseSchema = z.object({
  data: z.array(spaceSchema),
  metadata: paginationMetaSchema,
});

/**
 * Query parameters
 */

export const getSpacesQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
});

/**
 * Inferred types
 */

export type Address = z.infer<typeof addressSchema>;
export type Space = z.infer<typeof spaceSchema>;
export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type SpaceListResponse = z.infer<typeof spaceListResponseSchema>;
export type GetSpacesQuery = z.infer<typeof getSpacesQuerySchema>;
export type GetSpacesParams = z.infer<typeof getSpacesQuerySchema>;
