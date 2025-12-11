import { z } from "zod";

// Re-export shared pagination types for convenience
export {
  type PaginationMeta,
  type PaginationParams,
  type PaginatedResponse,
  paginationMetaSchema,
  paginationParamsSchema,
} from "@/shared/types/pagination";

/**
 * Schema for space entity validation.
 * Validates id, name, status, and code fields.
 */
export const spaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum(["active", "inactive", "archived"]),
  code: z.string(),
});

/**
 * Schema for paginated space list API response validation.
 * Validates data array and pagination metadata.
 */
export const spaceListResponseSchema = z.object({
  data: z.array(spaceSchema),
  metadata: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    itemsPerPage: z.number(),
  }),
});

/**
 * Schema for getSpaces query parameters validation.
 * Validates optional search, limit, and page parameters.
 */
export const getSpacesParamsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().positive().optional(),
  page: z.number().positive().optional(),
});

/** Inferred type for a single space entity */
export type Space = z.infer<typeof spaceSchema>;

/** Inferred type for space list API response */
export type SpaceListResponse = z.infer<typeof spaceListResponseSchema>;

/** Inferred type for getSpaces query parameters */
export type GetSpacesParams = z.infer<typeof getSpacesParamsSchema>;
