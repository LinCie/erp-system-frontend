import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/modules/auth/constants/token-config";

/**
 * Auth routes that should redirect to home if user is authenticated.
 */
const AUTH_ROUTES = ["/signin", "/signup"];

/**
 * Public routes that don't require authentication.
 */
const PUBLIC_ROUTES = ["/signin", "/signup"];

/**
 * Response structure from the refresh token endpoint.
 */
interface RefreshTokenResponse {
  access: string;
  refresh: string;
}

/**
 * Attempts to refresh the access token using the refresh token.
 * @param refreshToken - The current refresh token
 * @returns New tokens if successful, null if refresh failed
 */
async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse | null> {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL ?? ""}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RefreshTokenResponse;
    return data;
  } catch {
    return null;
  }
}

/**
 * Validates the access token by making a request to the backend.
 * @param accessToken - The access token to validate
 * @returns True if valid, false if expired/invalid
 */
async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL ?? ""}/auth/validate`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Creates a response with updated auth cookies.
 * @param response - The base response to add cookies to
 * @param tokens - The new tokens to set
 * @returns Response with updated cookies
 */
function setAuthCookies(
  response: NextResponse,
  tokens: RefreshTokenResponse
): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: "access_token",
    value: tokens.access,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set({
    name: "refresh_token",
    value: tokens.refresh,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return response;
}

/**
 * Clears auth cookies and redirects to signin.
 * @param request - The incoming request
 * @param callbackUrl - Optional callback URL after signin
 * @returns Response with cleared cookies and redirect
 */
function clearAuthAndRedirect(
  request: NextRequest,
  callbackUrl?: string
): NextResponse {
  const signinUrl = new URL("/signin", request.url);
  if (callbackUrl) {
    signinUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  const response = NextResponse.redirect(signinUrl);

  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");

  return response;
}

/**
 * Proxy for route protection with automatic token refresh.
 * - Validates access token on protected routes
 * - Refreshes expired access tokens using refresh token
 * - Clears tokens and redirects to signin if refresh fails
 * - Redirects authenticated users from auth pages to home
 * @param request - The incoming request
 * @returns NextResponse with redirect or continuation
 */
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route));

  // Handle authenticated users on auth routes
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Public routes don't need token validation
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // No tokens at all - redirect to signin
  if (!accessToken && !refreshToken) {
    return clearAuthAndRedirect(request, path);
  }

  // Has access token - validate it
  if (accessToken) {
    const isValid = await validateAccessToken(accessToken);

    if (isValid) {
      return NextResponse.next();
    }
  }

  // Access token missing or invalid - try refresh
  if (refreshToken) {
    const newTokens = await refreshAccessToken(refreshToken);

    if (newTokens) {
      // Refresh successful - set new cookies and continue
      const response = NextResponse.next();
      return setAuthCookies(response, newTokens);
    }
  }

  // Refresh failed or no refresh token - clear everything and redirect
  return clearAuthAndRedirect(request, path);
}

/**
 * Configure which routes the proxy should run on.
 * Excludes static files, API routes, and Next.js internals.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
