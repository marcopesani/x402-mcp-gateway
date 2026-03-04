import { z } from "zod";

export const siwxIntentSchema = z.enum(["signin", "link"]);

export const siwxChallengeRequestSchema = z.object({
  address: z.string().min(1),
  chainId: z.number().int().positive(),
  intent: siwxIntentSchema,
});

export const siwxChallengeResponseSchema = z.object({
  nonce: z.string().min(8),
  message: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const siwxVerifyRequestSchema = z.object({
  address: z.string().min(1),
  chainId: z.number().int().positive(),
  message: z.string().min(1),
  signature: z.string().min(1),
  intent: siwxIntentSchema,
});

export const siwxVerifyResponseSchema = z.object({
  ok: z.literal(true),
  userId: z.string().uuid(),
});

export const siwxUnlinkRequestSchema = z.object({
  address: z.string().min(1),
  chainId: z.number().int().positive(),
});

export type SiwxChallengeRequest = z.infer<typeof siwxChallengeRequestSchema>;
export type SiwxChallengeResponse = z.infer<typeof siwxChallengeResponseSchema>;
export type SiwxVerifyRequest = z.infer<typeof siwxVerifyRequestSchema>;
export type SiwxVerifyResponse = z.infer<typeof siwxVerifyResponseSchema>;
export type SiwxUnlinkRequest = z.infer<typeof siwxUnlinkRequestSchema>;
