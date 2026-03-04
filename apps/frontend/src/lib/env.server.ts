import "server-only";

const defaults = {
  backendUrl: "http://localhost:4000",
  logLevel: "info",
  logJson: true,
} as const;

export const frontendServerEnv = {
  backendUrl: process.env.BACKEND_URL ?? defaults.backendUrl,
  logLevel: process.env.FRONTEND_LOG_LEVEL ?? defaults.logLevel,
  logJson: process.env.FRONTEND_LOG_JSON === "0" ? false : defaults.logJson,
} as const;
