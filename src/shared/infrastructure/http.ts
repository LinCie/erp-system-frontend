import ky, { HTTPError } from "ky";

/**
 * Error response structure from the backend API.
 * Contains a message and optional validation issues.
 */
export interface ApiErrorResponse {
  message: string;
  issues?: Array<{
    code: string;
    message: string;
    path: (string | number)[];
  }>;
}

/**
 * Extended HTTPError with parsed API error details.
 */
export interface ApiError extends HTTPError {
  apiMessage?: string;
  apiIssues?: ApiErrorResponse["issues"];
}

/**
 * Extracts error message from API error response body.
 * @param response - The Response object from the failed request
 * @returns The extracted error message or null if extraction fails
 */
async function extractErrorMessage(
  response: Response
): Promise<ApiErrorResponse | null> {
  try {
    const clonedResponse = response.clone();
    const body = (await clonedResponse.json()) as ApiErrorResponse;
    if (body && typeof body.message === "string") {
      return body;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Centralized Ky HTTP client instance configured for the backend API.
 * Uses BACKEND_URL environment variable as the base URL prefix.
 * Includes error handling hooks to extract API error messages.
 *
 * @example
 * ```typescript
 * import { http } from '@/shared/infrastructure/http';
 *
 * const response = await http.post('auth/signin', { json: credentials });
 * const data = await response.json();
 * ```
 */
export const http = ky.create({
  prefixUrl: process.env.BACKEND_URL ?? "",
  timeout: 30000,
  hooks: {
    beforeError: [
      async (error: HTTPError): Promise<HTTPError> => {
        const { response } = error;
        if (response) {
          const errorData = await extractErrorMessage(response);
          if (errorData) {
            const apiError = error as ApiError;
            apiError.apiMessage = errorData.message;
            apiError.apiIssues = errorData.issues;
            apiError.message = `${errorData.message} (${response.status})`;
          }
        }
        return error;
      },
    ],
  },
});

/**
 * Type guard to check if an error is an HTTPError from Ky.
 * @param error - The error to check
 * @returns True if the error is an HTTPError
 */
export function isHttpError(error: unknown): error is ApiError {
  return error instanceof HTTPError;
}

/**
 * Extracts a user-friendly error message from any error.
 * Prioritizes API error messages when available.
 * @param error - The error to extract message from
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown): string {
  if (isHttpError(error)) {
    const apiError = error as ApiError;
    return (
      apiError.apiMessage ?? error.message ?? "An unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Creates an authenticated Ky HTTP client instance with Bearer token.
 * Uses Ky's beforeRequest hook to attach the Authorization header.
 *
 * @param token - The access token to use for authentication (optional)
 * @returns A Ky instance configured with Bearer token authentication
 *
 * @example
 * ```typescript
 * // In a Server Action
 * import { cookies } from 'next/headers';
 * import { createAuthenticatedHttp } from '@/shared/infrastructure/http';
 *
 * const cookieStore = await cookies();
 * const token = cookieStore.get('access_token')?.value;
 * const authHttp = createAuthenticatedHttp(token);
 * const data = await authHttp.get('protected-endpoint').json();
 * ```
 */
export function createAuthenticatedHttp(token?: string | null) {
  return http.extend({
    hooks: {
      beforeRequest: [
        (request) => {
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        },
      ],
    },
  });
}
