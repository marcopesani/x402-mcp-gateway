const defaults = {
  backendUrl: "http://localhost:4000",
  logLevel: "info",
  logJson: true,
  reownProjectId: "",
} as const;

export const frontendClientEnv = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? defaults.backendUrl,
  logLevel: process.env.NEXT_PUBLIC_FRONTEND_LOG_LEVEL ?? defaults.logLevel,
  logJson: process.env.NEXT_PUBLIC_FRONTEND_LOG_JSON === "0" ? false : defaults.logJson,
  reownProjectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? defaults.reownProjectId,
} as const;
