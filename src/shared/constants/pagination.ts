import { type PaginationMeta } from "../types/pagination";

/** Default pagination metadata for initial state */
export const DEFAULT_PAGINATION_META: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
};

/** Standard limit options for pagination selectors */
export const LIMIT_OPTIONS = [10, 20, 50] as const;

/** Type for limit option values */
export type LimitOption = (typeof LIMIT_OPTIONS)[number];
