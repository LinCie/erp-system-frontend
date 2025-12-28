import { z } from "zod";
import { entitySchema } from "@/shared/types";

export const inventoryItemSchema = z.object({
  id: z.coerce.number(),
  balance: z.coerce.number(),
  cost_per_unit: z.coerce.number(),
  notes: z.string().optional(),
  space_name: z.string(),
  status: z.string(),
});

export const itemFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
});

export const itemImageSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
  isNew: z.boolean().optional(),
});

export const itemSchema = entitySchema.omit({ status: true }).extend({
  name: z.string(),
  cost: z.string(),
  price: z.string(),
  weight: z.string(),
  status: z.union([z.string(), z.enum(["active", "inactive"])]),
  price_discount: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  notes: z.string().optional(),
  space_id: z.number().optional(),
  images: z.array(itemImageSchema).optional(),
  files: z.array(itemFileSchema).optional(),
  inventories: z.array(inventoryItemSchema).optional(),
});

export type Item = z.infer<typeof itemSchema>;
export type ItemImage = z.infer<typeof itemImageSchema>;
export type ItemFile = z.infer<typeof itemFileSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
