import { z } from "zod";
import { paginationMetaSchema } from "@/shared/types";

/**
 * Schema for trade item (minimal item data for selection).
 */
export const tradeItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string().nullable(),
  cost: z.string(),
  price: z.string(),
});

/**
 * Schema for get trade items query parameters.
 */
export const getTradeItemsQuerySchema = z.object({
  spaceId: z.number().optional(),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
});

/**
 * Schema for get trade items response.
 */
export const getTradeItemsResponseSchema = z.object({
  data: z.array(tradeItemSchema),
  metadata: paginationMetaSchema,
});

export type TradeItem = z.infer<typeof tradeItemSchema>;
export type GetTradeItemsQuery = z.infer<typeof getTradeItemsQuerySchema>;
export type GetTradeItemsResponse = z.infer<typeof getTradeItemsResponseSchema>;
