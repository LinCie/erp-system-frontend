import { z } from "zod";

/**
 * Trade status enum values.
 */
export const TRADE_STATUSES = [
  "TX_DRAFT",
  "TX_REQUEST",
  "TX_READY",
  "TX_SENT",
  "TX_RECEIVED",
  "TX_COMPLETED",
  "TX_CANCELED",
  "TX_RETURN",
  "TX_CLOSED",
] as const;

/**
 * Schema for trade status.
 */
export const tradeStatusSchema = z.union([z.string(), z.enum(TRADE_STATUSES)]);

export type TradeStatus = z.infer<typeof tradeStatusSchema>;

/**
 * Schema for trade file attachments.
 */
export const tradeFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
});

/**
 * Schema for trade external links.
 */
export const tradeLinkSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Schema for trade line item details (response).
 */
export const tradeDetailSchema = z.object({
  id: z.number(),
  item_id: z.number().nullable().optional(),
  model_type: z.string(),
  sku: z.string().optional(),
  name: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number(),
  weight: z.number(),
  debit: z.number(),
  credit: z.number(),
  notes: z.string().optional(),
});

/**
 * Schema for player info (sender, receiver, handler).
 */
export const playerInfoSchema = z.object({
  id: z.number(),
  code: z.string().optional(),
  name: z.string(),
});

/**
 * Schema for trade entity.
 */
export const tradeSchema = z.object({
  id: z.number(),
  number: z.string(),
  space_id: z.number(),
  status: tradeStatusSchema,
  total: z.string(),
  sent_time: z.string().nullable().optional(),
  received_time: z.string().nullable().optional(),
  sender_id: z.number().nullable().optional(),
  receiver_id: z.number().nullable().optional(),
  handler_id: z.number().nullable().optional(),
  parent_id: z.number().nullable().optional(),
  sender_notes: z.string().optional(),
  receiver_notes: z.string().optional(),
  handler_notes: z.string().optional(),
  description: z.string().optional(),
  fee: z.string().optional(),
  files: z.array(tradeFileSchema).optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(tradeLinkSchema).optional(),
  details: z.array(tradeDetailSchema).optional(),
  // Player info (populated when withPlayers=true)
  sender: playerInfoSchema.nullable().optional(),
  receiver: playerInfoSchema.nullable().optional(),
  handler: playerInfoSchema.nullable().optional(),
  // Aggregated fields
  sku: z.string().optional(),
  all_notes: z.string().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type Trade = z.infer<typeof tradeSchema>;
export type TradeFile = z.infer<typeof tradeFileSchema>;
export type TradeLink = z.infer<typeof tradeLinkSchema>;
export type TradeDetail = z.infer<typeof tradeDetailSchema>;
export type PlayerInfo = z.infer<typeof playerInfoSchema>;
