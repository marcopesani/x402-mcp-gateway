import { logEventNames, logLevelSchema, type LogLevel } from "@repo/auth-contracts/logging";
import { frontendClientEnv } from "./env.client";

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};

const parseLogLevel = (value: string): LogLevel => {
  const parsed = logLevelSchema.safeParse(value);
  return parsed.success ? parsed.data : "info";
};

const shouldLog = (current: LogLevel, next: LogLevel) => levelRank[next] >= levelRank[current];

export const logFrontendClientBackendRequestFailure = (
  requestId: string,
  path: string,
  status?: number,
  errorCode?: string,
) => {
  const currentLevel = parseLogLevel(frontendClientEnv.logLevel);
  if (!shouldLog(currentLevel, "error")) {
    return;
  }

  const payload = {
    ts: new Date().toISOString(),
    level: "error",
    service: "frontend",
    env: process.env.NODE_ENV ?? "development",
    "event.name": logEventNames.frontendBackendRequestFailed,
    "event.category": "http",
    "event.outcome": "failure",
    "request.id": requestId,
    path,
    status,
    "error.code": errorCode,
    message: "backend request failed",
  };

  if (frontendClientEnv.logJson) {
    console.error(JSON.stringify(payload));
    return;
  }

  console.error("backend request failed", payload);
};
