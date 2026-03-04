import { logEventNames, type LogLevel, logLevelSchema } from "@repo/auth-contracts/logging";

import { getCliLogJson, getCliLogLevel } from "./config.js";

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  error: 40,
  fatal: 50,
  info: 20,
  warn: 30,
};

const parseLogLevel = (value: string): LogLevel => {
  const parsed = logLevelSchema.safeParse(value);
  return parsed.success ? parsed.data : "info";
};

const shouldLog = (next: LogLevel) => {
  const current = parseLogLevel(getCliLogLevel());
  return levelRank[next] >= levelRank[current];
};

export const logCliBackendRequestFailure = (details: {
  backendUrl: string;
  errorMessage: string;
  path: string;
  requestId?: string;
  status?: number;
}) => {
  if (!shouldLog("error")) {
    return;
  }

  const payload = {
    backendUrl: details.backendUrl,
    env: process.env.NODE_ENV ?? "development",
    "event.category": "cli",
    "event.name": logEventNames.cliBackendRequestFailed,
    "event.outcome": "failure",
    level: "error",
    message: details.errorMessage,
    path: details.path,
    "request.id": details.requestId,
    service: "cli",
    status: details.status,
    ts: new Date().toISOString(),
  };

  if (getCliLogJson()) {
    process.stderr.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  process.stderr.write(
    `[cli:error] ${payload.message} (${payload.backendUrl}${payload.path}, request_id=${payload["request.id"] ?? "n/a"})\n`,
  );
};
