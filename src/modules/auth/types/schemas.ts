import { z } from "zod";

/**
 * Schema for user signup form validation.
 * Validates name (required), email (valid format), and password (min 6 chars).
 */
export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Schema for user signin form validation.
 * Validates email (valid format) and password (required).
 */
export const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Schema for API token response validation.
 * Validates access and refresh JWT tokens.
 */
export const tokensResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

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

/** Inferred type for signup form input */
export type SignupInput = z.infer<typeof signupSchema>;

/** Inferred type for signin form input */
export type SigninInput = z.infer<typeof signinSchema>;

/** Inferred type for API token response */
export type TokensResponse = z.infer<typeof tokensResponseSchema>;

/** Inferred type for API error response */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Action result type for server actions.
 * Contains success status, optional message, and field-specific errors.
 */
export interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}
