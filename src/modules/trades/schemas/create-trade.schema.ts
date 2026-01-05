import { z } from "zod";

/**
 * Schema for creating a new trade.
 */
export const createTradeSchema = z.object({
  space_id: z.number(),
  sender_id: z.number().nullable().optional(),
  sent_time: z.string().optional(),
  sender_notes: z.string().optional(),
  number: z.string().optional(),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
