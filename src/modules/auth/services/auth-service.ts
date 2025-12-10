import { http } from "@/shared/infrastructure/http";
import {
  type SignupInput,
  type SigninInput,
  type TokensResponse,
  tokensResponseSchema,
} from "../types/schemas";

/**
 * Authentication service for handling user signup, signin, signout, and token refresh.
 * All API responses are validated against Zod schemas for type safety.
 */
export const authService = {
  /**
   * Registers a new user with the provided credentials.
   * @param data - The signup credentials (name, email, password)
   * @returns Promise resolving to validated token response
   * @throws HTTPError if the request fails
   */
  async signup(data: SignupInput): Promise<TokensResponse> {
    const response = await http.post("auth/signup", { json: data }).json();
    return tokensResponseSchema.parse(response);
  },

  /**
   * Authenticates an existing user with email and password.
   * @param data - The signin credentials (email, password)
   * @returns Promise resolving to validated token response
   * @throws HTTPError if authentication fails
   */
  async signin(data: SigninInput): Promise<TokensResponse> {
    const response = await http.post("auth/signin", { json: data }).json();
    return tokensResponseSchema.parse(response);
  },

  /**
   * Signs out the user by invalidating the refresh token.
   * @param refreshToken - The refresh token to invalidate
   * @param httpClient - Optional authenticated HTTP client instance for Bearer token auth
   * @throws HTTPError if the request fails
   */
  async signout(refreshToken: string): Promise<void> {
    await http.post("auth/signout", { json: { refreshToken } });
  },

  /**
   * Refreshes the access token using a valid refresh token.
   * @param refreshToken - The refresh token to use for renewal
   * @returns Promise resolving to validated token response with new tokens
   * @throws HTTPError if the refresh token is invalid or expired
   */
  async refresh(refreshToken: string): Promise<TokensResponse> {
    const response = await http
      .post("auth/refresh", { json: { refreshToken } })
      .json();
    return tokensResponseSchema.parse(response);
  },
};
