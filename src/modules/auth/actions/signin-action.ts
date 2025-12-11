"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "../services/auth-service";
import { signinSchema, type ActionResult } from "../types/schemas";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { setAuthCookies } from "@/shared/lib/auth-cookies";
import { mapZodErrors } from "@/shared/lib/validation";

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
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(validationResult.error),
    };
  }

  try {
    // Call auth service
    const tokens = await authService.signin(validationResult.data);

    // Set JWT cookies
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, tokens);
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
