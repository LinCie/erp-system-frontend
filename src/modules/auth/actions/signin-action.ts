"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "../services/auth-service";
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "../constants/token-config";
import { signinSchema, type ActionResult } from "../types/schemas";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server action for user signin.
 * Validates form data, calls the auth service, and sets JWT cookies on success.
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data containing email and password
 * @returns ActionResult with success status, message, and field-specific errors
 */
export async function signinAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Extract form fields
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validate with Zod schema
  const validationResult = signinSchema.safeParse(rawData);

  if (!validationResult.success) {
    // Map Zod errors to field-specific errors
    const errors: Record<string, string[]> = {};
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0]?.toString() ?? "form";
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(issue.message);
    }

    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  try {
    // Call auth service
    const tokens = await authService.signin(validationResult.data);

    // Set JWT cookies
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set({
      name: "access_token",
      value: tokens.access,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    cookieStore.set({
      name: "refresh_token",
      value: tokens.refresh,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  } catch (error) {
    // Handle API errors
    if (isHttpError(error)) {
      const apiError = error as ApiError;

      // Map API issues to field-specific errors if available
      const errors: Record<string, string[]> = {};
      if (apiError.apiIssues) {
        for (const issue of apiError.apiIssues) {
          const field = issue.path[0]?.toString() ?? "form";
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(issue.message);
        }
      }

      return {
        success: false,
        message: apiError.apiMessage ?? "Invalid credentials",
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      };
    }

    // Handle unexpected errors
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }

  // Redirect to home (dashboard) on success
  redirect("/");
}
