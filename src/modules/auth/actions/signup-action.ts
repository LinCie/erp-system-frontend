"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "../services/auth-service";
import { signupSchema, type ActionResult } from "../types/schemas";
import {
  isHttpError,
  mapApiErrors,
  type ApiError,
} from "@/shared/infrastructure/http";
import { setAuthCookies } from "@/shared/lib/auth-cookies";
import { mapZodErrors } from "@/shared/lib/validation";

/**
 * Server action for user signup.
 * Validates form data, calls the auth service, and sets JWT cookies on success.
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data containing name, email, and password
 * @returns ActionResult with success status, message, and field-specific errors
 */
export async function signupAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Extract form fields
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validate with Zod schema
  const validationResult = signupSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(validationResult.error),
    };
  }

  try {
    // Call auth service
    const tokens = await authService.signup(validationResult.data);

    // Set JWT cookies
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, tokens);
  } catch (error) {
    // Handle API errors
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Signup failed",
        errors: mapApiErrors(apiError),
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
