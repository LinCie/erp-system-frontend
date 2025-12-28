"use server";

import type { ActionResult } from "@/shared/types/action-result";

import { cookies } from "next/headers";
import { z } from "zod";
import { ApiError, isHttpError } from "@/shared/infrastructure/http";
import { requestUploadUrl } from "../services";
import { type RequestUploadResponse } from "@/shared/types";

/**
 * Server action for requesting a signed R2 upload URL.
 * @param contentType - MIME type of the file
 * @param size - File size in bytes
 * @returns ActionResult with signed URL and key
 */
export async function requestUploadUrlAction(
  contentType: string,
  size: number
): Promise<ActionResult<RequestUploadResponse>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await requestUploadUrl({
      token: accessToken,
      contentType,
      size,
    });
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Failed to get upload URL",
      };
    }
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid response from server" };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
