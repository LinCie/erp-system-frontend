import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import {
  setAuthCookies,
  clearAuthCookies,
  type AuthTokens,
} from "@/shared/lib/auth-cookies";
import { http } from "@/shared/infrastructure/http";
import { routing } from "@/shared/infrastructure/i18n";

/**
 * Create the next-intl middleware for locale routing.
 */
const handleI18nRouting = createMiddleware(routing);

/**
 * Auth routes that should redirect to home if user is authenticated.
 */
const AUTH_ROUTES = ["/signin", "/signup"];

/**
 * Public routes that don't require authentication.
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
 * Extracts locale from pathname or returns default.
 * @param pathname - The full pathname
 * @returns The locale string
 */
function getLocaleFromPathname(pathname: string): string {
  const localeMatch = pathname.match(
    new RegExp(`^/(${routing.locales.join("|")})`)
  );
  return localeMatch ? localeMatch[1] : routing.defaultLocale;
}

/**
 * Attempts to refresh the access token using the refresh token.
 * @param refreshToken - The current refresh token
 * @returns New tokens if successful, null if refresh failed
 */
async function refreshAccessToken(
  refreshToken: string
): Promise<AuthTokens | null> {
  try {
    const response = await http.post("auth/refresh", {
      json: { refreshToken },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthTokens;
  } catch {
    return null;
  }
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
  const locale = getLocaleFromPathname(request.nextUrl.pathname);
  const signinUrl = new URL(`/${locale}/signin`, request.url);

  if (callbackUrl) {
    signinUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  const response = NextResponse.redirect(signinUrl);
  clearAuthCookies(response.cookies);

  return response;
}

/**
 * Proxy for route protection with i18n routing and automatic token refresh.
 * - Handles locale routing before authentication checks
 * - Trusts access token existence (backend validates on API calls)
 * - Only attempts refresh when access token is missing but refresh token exists
 * - Clears tokens and redirects to signin if refresh fails
 * - Redirects authenticated users from auth pages to home
 * @param request - The incoming request
 * @returns NextResponse with redirect or continuation
 */
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isAuthRoute = matchesLocalizedRoute(path, AUTH_ROUTES);
  const isPublicRoute = matchesLocalizedRoute(path, PUBLIC_ROUTES);

  // Handle authenticated users on auth routes - redirect to home with locale
  if (accessToken && isAuthRoute) {
    const locale = getLocaleFromPathname(path);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Public routes - apply i18n routing only
  if (isPublicRoute) {
    return handleI18nRouting(request);
  }

  // No tokens at all - redirect to signin
  if (!accessToken && !refreshToken) {
    const pathnameWithoutLocale = getPathnameWithoutLocale(path);
    return clearAuthAndRedirect(request, pathnameWithoutLocale);
  }

  // Has access token - trust it, let backend validate on actual API calls
  if (accessToken) {
    return handleI18nRouting(request);
  }

  // Access token missing but has refresh token - try refresh
  if (refreshToken) {
    const newTokens = await refreshAccessToken(refreshToken);

    if (newTokens) {
      const response = handleI18nRouting(request);
      setAuthCookies(response.cookies, newTokens);
      return response;
    }
  }

  // Refresh failed or no refresh token - clear everything and redirect
  const pathnameWithoutLocale = getPathnameWithoutLocale(path);
  return clearAuthAndRedirect(request, pathnameWithoutLocale);
}

/**
 * Configure which routes the proxy should run on.
 * Excludes API routes, static files, and Next.js internals.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
