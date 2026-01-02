import { z } from "zod";
import { tradeFileSchema, tradeLinkSchema } from "./trades.schema";

/**
 * Schema for trade detail input (for creating/updating line items).
 */
export const tradeDetailInputSchema = z.object({
  item_id: z.number().nullable(),
  model_type: z.string(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number().optional(),
  weight: z.number().optional(),
  sku: z.string().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for updating a trade.
 */
export const updateTradeSchema = z.object({
  handler_id: z.number().nullable(),
  sent_time: z.string().nullable().optional(),
  received_time: z.string().nullable().optional(),
  receiver_id: z.number().nullable().optional(),
  receiver_notes: z.string().optional(),
  handler_notes: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  parent_id: z.number().nullable().optional(),
  files: z.array(tradeFileSchema).optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(tradeLinkSchema).optional(),
  details: z.array(tradeDetailInputSchema).optional(),
});

export type TradeDetailInput = z.infer<typeof tradeDetailInputSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
