import { z } from "zod";
import { tradeFileSchema, tradeLinkSchema } from "./trades.schema";

/**
 * Trade detail type enum values.
 */
export const TRADE_DETAIL_TYPES = [
  "ITR",
  "SO",
  "BILL",
  "PAY",
  "PO",
  "DMG",
  "RTR",
  "TAX",
  "UNDF",
] as const;

export type TradeDetailType = (typeof TRADE_DETAIL_TYPES)[number];

/**
 * Schema for creating a trade detail (POST /trades/{id}/details).
 * Based on OpenAPI CreateTradeDetailBody.
 */
export const createTradeDetailSchema = z.object({
  item_id: z.number(),
  model_type: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number().optional(),
  weight: z.number().optional(),
  sku: z.string().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for updating a trade detail (PATCH /trades/{id}/details/{detailId}).
 * Based on OpenAPI UpdateTradeDetailBody.
 * Note: transaction_id, detail_type, and detail_id are immutable.
 */
export const updateTradeDetailSchema = z.object({
  model_type: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  discount: z.number().optional(),
  weight: z.number().optional(),
  sku: z.string().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for trade detail input (UI representation).
 * Includes optional id for existing persisted details.
 */
export const tradeDetailInputSchema = z.object({
  id: z.number().optional(),
  item_id: z.number().nullable(),
  model_type: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number().optional(),
  weight: z.number().optional(),
  sku: z.string().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for updating a trade transaction (PATCH /trades/{id}).
 * Based on OpenAPI UpdateTradeTransactionBody.
 * IMPORTANT: details field is NOT allowed and will be rejected by backend.
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
});

export type CreateTradeDetailInput = z.infer<typeof createTradeDetailSchema>;
export type UpdateTradeDetailInput = z.infer<typeof updateTradeDetailSchema>;
export type TradeDetailInput = z.infer<typeof tradeDetailInputSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
