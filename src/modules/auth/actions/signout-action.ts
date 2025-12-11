"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "../services/auth-service";
import { clearAuthCookies } from "@/shared/lib/auth-cookies";

/**
 * Server action for user signout.
 * Gets tokens from cookies, creates authenticated HTTP client,
 * calls auth service to invalidate the refresh token,
 * deletes JWT cookies, and redirects to signin page.
 */
export async function signoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Get tokens from cookies
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Call auth service to invalidate the refresh token with authenticated HTTP client
  if (refreshToken) {
    try {
      await authService.signout(refreshToken);
    } catch {
      // Silently handle errors - we still want to clear cookies and redirect
      // even if the API call fails (e.g., token already expired)
    }
  }

  // Delete JWT cookies
  clearAuthCookies(cookieStore);

  // Redirect to signin page
  redirect("/signin");
}
