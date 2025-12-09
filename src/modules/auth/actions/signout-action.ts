"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthenticatedHttp } from "@/shared/infrastructure/http";
import { authService } from "../services/auth-service";

/**
 * Server action for user signout.
 * Gets tokens from cookies, creates authenticated HTTP client,
 * calls auth service to invalidate the refresh token,
 * deletes JWT cookies, and redirects to signin page.
 */
export async function signoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Get tokens from cookies
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Call auth service to invalidate the refresh token with authenticated HTTP client
  if (refreshToken) {
    try {
      const authHttp = createAuthenticatedHttp(accessToken);
      await authService.signout(refreshToken, authHttp);
    } catch {
      // Silently handle errors - we still want to clear cookies and redirect
      // even if the API call fails (e.g., token already expired)
    }
  }

  // Delete JWT cookies
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  // Redirect to signin page
  redirect("/signin");
}
