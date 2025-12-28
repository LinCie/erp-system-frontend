import { z } from "zod";
import { itemSchema } from "./items.schema";

export const createItemSchema = itemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  inventories: true,
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
