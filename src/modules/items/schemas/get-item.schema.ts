import { z } from "zod";

export const getItemQuerySchema = z.object({
  spaceId: z.number().optional(),
  withInventory: z.boolean().optional(),
});

export type GetItemQuery = z.infer<typeof getItemQuerySchema>;
