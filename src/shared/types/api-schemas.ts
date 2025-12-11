import { z } from "zod";

/**
 * Schema for API error response validation.
 * Validates error message and optional issues array.
 */
export const errorResponseSchema = z.object({
  message: z.string(),
  issues: z
    .array(
      z.object({
        code: z.string(),
        message: z.string(),
        path: z.array(z.union([z.string(), z.number()])),
      })
    )
    .optional(),
});

/** Inferred type for API error response */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
