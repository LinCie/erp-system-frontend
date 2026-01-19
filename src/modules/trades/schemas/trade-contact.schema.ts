import { z } from "zod";
import { paginationMetaSchema } from "@/shared/types";

export const getTradeContactsQuerySchema = z.object({
  space_id: z.number().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  sort: z.enum(["id", "name"]).optional(),
  with_full_details: z.boolean().optional(),
});

export const tradeContactSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email().optional(),
});

export const getTradeContactsResponseSchema = z.object({
  data: z.array(tradeContactSchema),
  metadata: paginationMetaSchema,
});

export type TradeContact = z.infer<typeof tradeContactSchema>;
export type GetTradeContactsQuery = z.infer<typeof getTradeContactsQuerySchema>;
export type GetTradeContactsResponse = z.infer<
  typeof getTradeContactsResponseSchema
>;
