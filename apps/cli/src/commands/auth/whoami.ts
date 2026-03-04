import {
  BackendHttpError,
  fetchJsonOrThrow,
} from "../../lib/api-client.js";
import {
  apiCommandFlags,
  BaseApiCommand,
} from "../../lib/base-api-command.js";
import { logCliBackendRequestFailure } from "../../lib/logger.js";

type WhoamiPayload = {
  authenticated: true;
  userId: string;
  via: "api-key" | "session";
};

const parseWhoamiPayload = (payload: unknown): WhoamiPayload => {
  if (
    typeof payload !== "object" ||
    payload === null ||
    (payload as { authenticated?: unknown }).authenticated !== true ||
    !["api-key", "session"].includes((payload as { via?: string }).via ?? "") ||
    typeof (payload as { userId?: unknown }).userId !== "string"
  ) {
    throw new Error("Backend returned an invalid whoami payload");
  }

  return payload as WhoamiPayload;
};

export default class AuthWhoami extends BaseApiCommand<typeof AuthWhoami> {
  static description = "Check current authenticated identity";
  static enableJsonFlag = true;
  static flags = apiCommandFlags;

  async run(): Promise<WhoamiPayload> {
    const { apiKey, backendUrl } = await this.parseApiFlags(AuthWhoami);

    try {
      const payload = await fetchJsonOrThrow(
        backendUrl,
        "/auth/whoami",
        parseWhoamiPayload,
        { method: "GET" },
        apiKey,
      );
      this.log(JSON.stringify(payload, null, 2));
      return payload;
    } catch (error) {
      if (error instanceof BackendHttpError) {
        logCliBackendRequestFailure({
          backendUrl,
          errorMessage: `Authentication failed: backend returned ${error.status}`,
          path: error.path ?? "/auth/whoami",
          requestId: error.requestId,
          status: error.status,
        });
        this.error(
          `Authentication failed: backend returned ${error.status}${
            error.requestId ? ` (request id: ${error.requestId})` : ""
          }`,
        );
      }

      logCliBackendRequestFailure({
        backendUrl,
        errorMessage: error instanceof Error ? error.message : "unknown error",
        path: "/auth/whoami",
      });
      this.error(
        `Failed to reach backend at ${backendUrl}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }
}
