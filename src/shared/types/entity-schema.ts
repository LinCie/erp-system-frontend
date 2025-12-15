import { z } from "zod";

const statusSchema = z.enum(["active", "inactive", "archived"]);

type Status = z.infer<typeof statusSchema>;

const entitySchema = z.object({
  id: z.number(),
  status: statusSchema,
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
  deleted_at: z.iso.datetime().optional(),
});

type Entity = z.infer<typeof entitySchema>;

export type { Entity, Status };
export { entitySchema, statusSchema };
