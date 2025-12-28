import { z } from "zod";

export const requestUploadBodySchema = z.object({
  contentType: z.string(),
  size: z.number(),
});

export const requestUploadResponseSchema = z.object({
  url: z.string(),
  key: z.string(),
});

export type RequestUploadBody = z.infer<typeof requestUploadBodySchema>;
export type RequestUploadResponse = z.infer<typeof requestUploadResponseSchema>;
