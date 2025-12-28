import { z } from "zod";
import { paginationMetaSchema } from "@/shared/types";
import { itemSchema } from "./items.schema";

export const getManyItemsQuerySchema = z.object({
  spaceId: z.number().optional(),
  type: z.enum(["full", "partial"]),
  search: z.string().optional(),
  status: z
    .enum(["active", "inactive", "discounted", "all", "unknown"])
    .optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  withInventory: z.boolean().optional(),
});

export const getManyItemsResponseSchema = z.object({
  data: z.array(itemSchema),
  metadata: paginationMetaSchema,
});

export type GetManyItemsQuery = z.infer<typeof getManyItemsQuerySchema>;
export type GetManyItemsResponse = z.infer<typeof getManyItemsResponseSchema>;
