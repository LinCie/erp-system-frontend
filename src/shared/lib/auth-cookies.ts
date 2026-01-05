import { type ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

/** Access token expires in 10 minutes (600 seconds) */
export const ACCESS_TOKEN_MAX_AGE = 10 * 60;

/** Refresh token expires in 7 days (604800 seconds) */
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * Token pair for authentication.
 */
export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * Sets authentication cookies with secure defaults.
 * @param cookieStore - The cookie store from next/headers
 * @param tokens - The access and refresh tokens to store
 * @example
 * ```typescript
 * const cookieStore = await cookies();
 * setAuthCookies(cookieStore, { access: "...", refresh: "..." });
 * ```
 */
export function setAuthCookies(
  cookieStore: ResponseCookies,
  tokens: AuthTokens
): void {
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
}

/**
 * Clears authentication cookies.
 * @param cookieStore - The cookie store from next/headers
 * @example
 * ```typescript
 * const cookieStore = await cookies();
 * clearAuthCookies(cookieStore);
 * ```
 */
export function clearAuthCookies(cookieStore: ResponseCookies): void {
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
