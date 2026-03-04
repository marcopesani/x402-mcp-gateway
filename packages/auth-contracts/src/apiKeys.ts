import { z } from "zod";

export const issueApiKeyRequestSchema = z.object({
  name: z.string().min(1).max(64),
});

export const issueApiKeyResponseSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  prefix: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const apiKeyListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  prefix: z.string().min(1),
  revokedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const listApiKeysResponseSchema = z.object({
  items: z.array(apiKeyListItemSchema),
});

export const revokeApiKeyResponseSchema = z.object({
  ok: z.literal(true),
});

export type IssueApiKeyRequest = z.infer<typeof issueApiKeyRequestSchema>;
