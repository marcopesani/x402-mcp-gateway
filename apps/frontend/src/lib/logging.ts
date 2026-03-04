import "server-only";
import { logEventNames, logLevelSchema, type LogLevel } from "@repo/auth-contracts/logging";
import { frontendServerEnv } from "./env.server";

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

const writeFrontendLog = (
  level: LogLevel,
  message: string,
  details: Record<string, unknown>,
) => {
  const currentLevel = parseLogLevel(frontendServerEnv.logLevel);
  if (!shouldLog(currentLevel, level)) {
    return;
  }

  const payload = {
    ts: new Date().toISOString(),
    level,
    service: "frontend",
    env: process.env.NODE_ENV ?? "development",
    "event.category": "http",
    ...details,
    message,
  };

  if (frontendServerEnv.logJson) {
    const serialized = JSON.stringify(payload);
    if (level === "error" || level === "fatal") {
      console.error(serialized);
      return;
    }
    if (level === "warn") {
      console.warn(serialized);
      return;
    }
    console.info(serialized);
    return;
  }

  if (level === "error" || level === "fatal") {
    console.error(message, payload);
    return;
  }
  if (level === "warn") {
    console.warn(message, payload);
    return;
  }
  console.info(message, payload);
};

export const logFrontendBackendRequestFailure = (
  requestId: string,
  path: string,
  status?: number,
  errorCode?: string,
) => {
  writeFrontendLog("error", "backend request failed", {
    "event.name": logEventNames.frontendBackendRequestFailed,
    "event.outcome": "failure",
    "request.id": requestId,
    path,
    status,
    "error.code": errorCode,
  });
};
