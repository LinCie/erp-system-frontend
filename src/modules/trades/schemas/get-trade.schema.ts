import { z } from "zod";

/**
 * Schema for get trade query parameters.
 */
export const getTradeQuerySchema = z.object({
  withDetails: z.boolean().optional(),
  withPlayers: z.boolean().optional(),
  withChildren: z.boolean().optional(),
});

export type GetTradeQuery = z.infer<typeof getTradeQuerySchema>;
