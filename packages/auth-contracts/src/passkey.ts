import { z } from "zod";

export const passkeyIntentSchema = z.enum(["signup", "link"]);

export const passkeyRegisterOptionsRequestSchema = z.object({
  username: z.string().min(1).optional(),
  intent: passkeyIntentSchema.optional(),
});

export const passkeyRegisterVerifyRequestSchema = z.object({
  id: z.string().min(1),
  rawId: z.string().min(1).optional(),
  response: z.record(z.string(), z.unknown()),
  type: z.string().optional(),
  clientExtensionResults: z.record(z.string(), z.unknown()).optional(),
});

export const passkeyLoginVerifyRequestSchema = z.object({
  id: z.string().min(1),
  rawId: z.string().min(1).optional(),
  response: z.record(z.string(), z.unknown()),
  type: z.string().optional(),
  clientExtensionResults: z.record(z.string(), z.unknown()).optional(),
});

export const passkeyVerifyResponseSchema = z.object({
  ok: z.literal(true),
  userId: z.string().uuid(),
});

export type PasskeyRegisterOptionsRequest = z.infer<typeof passkeyRegisterOptionsRequestSchema>;
export type PasskeyRegisterVerifyRequest = z.infer<typeof passkeyRegisterVerifyRequestSchema>;
export type PasskeyLoginVerifyRequest = z.infer<typeof passkeyLoginVerifyRequestSchema>;
