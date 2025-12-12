import { z } from "zod";

// Re-export shared types for convenience
export {
  type ActionResult,
  initialActionState,
  type ErrorResponse,
  errorResponseSchema,
} from "@/shared/types";

/**
 * Auth request/response schemas
 */

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const tokensResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export const validateResponseSchema = z.object({
  valid: z.boolean(),
});

/**
 * Inferred types
 */

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type SignoutInput = z.infer<typeof signoutSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type TokensResponse = z.infer<typeof tokensResponseSchema>;
export type ValidateResponse = z.infer<typeof validateResponseSchema>;
