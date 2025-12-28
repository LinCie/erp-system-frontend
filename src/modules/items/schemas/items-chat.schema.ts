import { z } from "zod";

export const itemChatSchema = z.object({
  prompt: z.string(),
});

export const itemChatResponseSchema = z.object({
  response: z.string(),
});

export type ItemChatInput = z.infer<typeof itemChatSchema>;
export type ItemChatResponse = z.infer<typeof itemChatResponseSchema>;
