import { z } from "zod";
import { paginationMetaSchema } from "@/shared/types";

export const getMutationsQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const mutationItemSchema = z.object({
  id: z.number(),
  transaction_id: z.number(),
  sent_time: z.string().optional(),
  number: z.string().optional(),
  sender_notes: z.string().optional(),
  handler_notes: z.string().optional(),
  notes: z.string().optional(),
  model_type: z.string().optional(),
  cost_per_unit: z.string(),
  debit: z.string(),
  credit: z.string(),
});

const mutationSummarySchema = z.object({
  initialBalance: z.number(),
  initialDebit: z.number(),
  initialCredit: z.number(),
  pageDebit: z.number(),
  pageCredit: z.number(),
});

export const getMutationsResponse = z.object({
  data: z.array(mutationItemSchema),
  metadata: paginationMetaSchema,
  summary: mutationSummarySchema,
});

export type GetMutationsQuery = z.infer<typeof getMutationsQuerySchema>;
