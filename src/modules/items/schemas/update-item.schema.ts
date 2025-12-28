import { z } from "zod";
import { createItemSchema } from "./create-item.schema";

export const updateItemSchema = createItemSchema.partial();

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
