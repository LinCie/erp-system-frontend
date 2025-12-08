import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/modules/auth/constants/token-config";
import { routing } from "@/shared/infrastructure/i18n";

/**
 * Create the next-intl middleware for locale routing.
 */
const handleI18nRouting = createMiddleware(routing);

/**
 * Auth routes that should redirect to home if user is authenticated.
 * Uses locale-aware patterns (e.g., '/id/signin', '/en/signin').
 */
const AUTH_ROUTES = ["/signin", "/signup"];

/**
 * Public routes that don't require authentication.
 * Uses locale-aware patterns (e.g., '/id/signin', '/en/signin').
 */
const PUBLIC_ROUTES = ["/signin", "/signup"];

/**
 * Check if a pathname matches a route pattern with locale prefix.
 * @param pathname - The current pathname (e.g., '/id/signin')
 * @param routes - Array of route patterns without locale (e.g., ['/signin'])
 * @returns True if pathname matches any route with any supported locale
 */
function matchesLocalizedRoute(pathname: string, routes: string[]): boolean {
  const localePattern = `^/(${routing.locales.join("|")})`;
  return routes.some((route) => {
    const pattern = new RegExp(`${localePattern}${route}(/.*)?$`, "i");
    return pattern.test(pathname);
  });
}

/**
 * Extract the pathname without locale prefix.
 * @param pathname - The full pathname (e.g., '/id/dashboard')
 * @returns Pathname without locale (e.g., '/dashboard')
 */
function getPathnameWithoutLocale(pathname: string): string {
  const localePattern = new RegExp(`^/(${routing.locales.join("|")})`, "i");
  return pathname.replace(localePattern, "") || "/";
}

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
 * Clears auth cookies and redirects to signin with locale prefix.
 * @param request - The incoming request
 * @param callbackUrl - Optional callback URL after signin
 * @returns Response with cleared cookies and redirect
 */
function clearAuthAndRedirect(
  request: NextRequest,
  callbackUrl?: string
): NextResponse {
  // Extract current locale from pathname or use default
  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(
    new RegExp(`^/(${routing.locales.join("|")})`)
  );
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  const signinUrl = new URL(`/${locale}/signin`, request.url);
  if (callbackUrl) {
    signinUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  const response = NextResponse.redirect(signinUrl);

  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");

  return response;
}

/**
 * Proxy for route protection with i18n routing and automatic token refresh.
 * - Handles locale routing before authentication checks (Requirement 6.1)
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

  // Check if route matches locale-aware patterns (Requirement 6.2)
  const isAuthRoute = matchesLocalizedRoute(path, AUTH_ROUTES);
  const isPublicRoute = matchesLocalizedRoute(path, PUBLIC_ROUTES);

  // Handle authenticated users on auth routes - redirect to home with locale
  if (accessToken && isAuthRoute) {
    const localeMatch = path.match(
      new RegExp(`^/(${routing.locales.join("|")})`)
    );
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Public routes - apply i18n routing only (Requirement 6.1)
  if (isPublicRoute) {
    return handleI18nRouting(request);
  }

  // No tokens at all - redirect to signin
  if (!accessToken && !refreshToken) {
    const pathnameWithoutLocale = getPathnameWithoutLocale(path);
    return clearAuthAndRedirect(request, pathnameWithoutLocale);
  }

  // Has access token - validate it
  if (accessToken) {
    const isValid = await validateAccessToken(accessToken);

    if (isValid) {
      // Apply i18n routing for valid authenticated requests
      return handleI18nRouting(request);
    }
  }

  // Access token missing or invalid - try refresh
  if (refreshToken) {
    const newTokens = await refreshAccessToken(refreshToken);

    if (newTokens) {
      // Refresh successful - apply i18n routing and set new cookies
      const response = handleI18nRouting(request);
      return setAuthCookies(response, newTokens);
    }
  }

  // Refresh failed or no refresh token - clear everything and redirect
  const pathnameWithoutLocale = getPathnameWithoutLocale(path);
  return clearAuthAndRedirect(request, pathnameWithoutLocale);
}

/**
 * Configure which routes the proxy should run on.
 * Excludes API routes, static files, and Next.js internals (Requirement 6.3).
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
