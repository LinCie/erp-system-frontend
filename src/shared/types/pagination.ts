import { z } from "zod";

/**
 * Schema for pagination metadata validation.
 * Standard pagination info returned by paginated API endpoints.
 */
export const paginationMetaSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  itemsPerPage: z.number(),
});

/**
 * Schema for common pagination query parameters.
 * Use for validating pagination inputs in API calls.
 */
export const paginationParamsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().positive().optional(),
  page: z.number().positive().optional(),
});

/** Inferred type for pagination metadata */
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/** Inferred type for pagination query parameters */
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Generic paginated response type.
 * Use for typing paginated API responses.
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMeta;
}
