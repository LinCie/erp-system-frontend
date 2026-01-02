import { z } from "zod";
import { paginationMetaSchema } from "@/shared/types";
import { tradeSchema } from "./trades.schema";

/**
 * Schema for get many trades query parameters.
 */
export const getManyTradesQuerySchema = z.object({
  spaceId: z.number().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  status: z.string().optional(),
  modelType: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["id", "number", "total", "created_at", "sent_time"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  withDetails: z.string().optional(),
  withPlayers: z.string().optional(),
});

/**
 * Schema for get many trades response.
 */
export const getManyTradesResponseSchema = z.object({
  data: z.array(tradeSchema),
  metadata: paginationMetaSchema,
});

export type GetManyTradesQuery = z.infer<typeof getManyTradesQuerySchema>;
export type GetManyTradesResponse = z.infer<typeof getManyTradesResponseSchema>;
