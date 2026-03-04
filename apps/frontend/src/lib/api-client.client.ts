import { frontendClientEnv } from "./env.client";
import { logFrontendClientBackendRequestFailure } from "./logging.client";

const backendUrl = frontendClientEnv.backendUrl;

export async function backendFetchClient(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const targetUrl = backendUrl.length > 0 ? `${backendUrl}${path}` : path;
  const headers = new Headers(init.headers);
  const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  headers.set("x-request-id", requestId);
  try {
    const response = await fetch(targetUrl, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      logFrontendClientBackendRequestFailure(
        response.headers.get("x-request-id") ?? requestId,
        path,
        response.status,
      );
    }
    return response;
  } catch (error) {
    logFrontendClientBackendRequestFailure(
      requestId,
      path,
      undefined,
      error instanceof Error ? error.name : "unknown_error",
    );
    throw error;
  }
}
