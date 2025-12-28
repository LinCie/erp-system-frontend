import { http } from "@/shared/infrastructure/http";
import { requestUploadResponseSchema } from "@/shared/types";

interface RequestUploadParams {
  token: string;
  contentType: string;
  size: number;
}

/**
 * Requests a signed R2 upload URL.
 * @param params - Request parameters containing token, content type, and file size
 * @returns Signed URL and key for upload
 */
export async function requestUploadUrl(params: RequestUploadParams) {
  const { token, contentType, size } = params;
  const response = await http
    .post("items/upload", {
      context: { token },
      json: { contentType, size },
    })
    .json();
  return requestUploadResponseSchema.parse(response);
}
