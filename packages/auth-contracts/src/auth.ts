import { z } from "zod";

export const loginMethodSchema = z.enum(["passkey", "wallet"]);

export const authMethodSchema = z.object({
  id: z.string().uuid(),
  type: loginMethodSchema,
  label: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable(),
});

export const sessionResponseSchema = z.object({
  authenticated: z.boolean(),
  user: sessionUserSchema.nullable(),
  methods: z.array(authMethodSchema),
});

export const unlinkMethodRequestSchema = z.object({
  methodId: z.string().uuid(),
});

export const logoutResponseSchema = z.object({
  ok: z.literal(true),
});

export const whoamiResponseSchema = z.object({
  authenticated: z.literal(true),
  via: z.enum(["api-key", "session"]),
  userId: z.string().uuid(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type UnlinkMethodRequest = z.infer<typeof unlinkMethodRequestSchema>;
export type WhoamiResponse = z.infer<typeof whoamiResponseSchema>;
