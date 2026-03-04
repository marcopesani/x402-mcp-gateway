export const getBackendUrl = (explicitUrl?: string) =>
  explicitUrl ?? process.env.BREVET_BACKEND_URL ?? "http://localhost:4000";

export const getApiKey = (explicitApiKey?: string) =>
  explicitApiKey ?? process.env.BREVET_API_KEY ?? undefined;

export const hasConfiguredBackendUrl = (explicitUrl?: string) =>
  explicitUrl !== undefined || process.env.BREVET_BACKEND_URL !== undefined;

export const getCliLogLevel = () => process.env.BREVET_LOG_LEVEL ?? "info";

export const getCliLogJson = () => process.env.BREVET_LOG_JSON !== "0";
