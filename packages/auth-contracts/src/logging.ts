import { z } from "zod";

export const logLevelSchema = z.enum(["debug", "info", "warn", "error", "fatal"]);

export const eventOutcomeSchema = z.enum(["success", "failure"]);

export const logEventCategorySchema = z.enum(["http", "auth", "security", "system", "cli"]);

export const requiredLogFieldSchema = z.enum([
  "service",
  "env",
  "event.name",
  "event.category",
  "event.outcome",
  "request.id",
]);

export const requiredLogFields = requiredLogFieldSchema.options;

export const logEventNames = {
  httpRequestCompleted: "http.request.completed",
  httpRequestFailed: "http.request.failed",
  authLoginSucceeded: "auth.login.succeeded",
  authLoginFailed: "auth.login.failed",
  authMethodLinked: "auth.method.linked",
  authMethodUnlinked: "auth.method.unlinked",
  authApiKeyIssued: "auth.api_key.issued",
  authApiKeyRevoked: "auth.api_key.revoked",
  authSessionLoggedOut: "auth.session.logged_out",
  authWhoamiApiKey: "auth.whoami.api_key",
  authWhoamiSession: "auth.whoami.session",
  authWhoamiUnauthorized: "auth.whoami.unauthorized",
  cliBackendRequestFailed: "cli.backend.request.failed",
  frontendBackendRequestFailed: "frontend.backend.request.failed",
} as const;

export type LogLevel = z.infer<typeof logLevelSchema>;
export type EventOutcome = z.infer<typeof eventOutcomeSchema>;
export type LogEventCategory = z.infer<typeof logEventCategorySchema>;
