/**
 * Token expiration configuration for authentication cookies.
 * Values are in seconds for use with cookie maxAge.
 */

/** Access token expires in 15 minutes (900 seconds) */
export const ACCESS_TOKEN_MAX_AGE = 15 * 60;

/** Refresh token expires in 7 days (604800 seconds) */
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
