"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "../services/auth-service";

/**
 * Server action for user signout.
 * Gets refresh token from cookies, calls auth service to invalidate it,
 * deletes JWT cookies, and redirects to signin page.
 */
export async function signoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Get refresh token from cookies
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Call auth service to invalidate the refresh token
  if (refreshToken) {
    try {
      await authService.signout(refreshToken);
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
