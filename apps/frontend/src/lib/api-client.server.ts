import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { frontendServerEnv } from "./env.server";
import { logFrontendBackendRequestFailure } from "./logging";

const backendUrl = frontendServerEnv.backendUrl;

export async function backendFetchServer(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const inboundHeaders = await headers();
  const requestId = inboundHeaders.get("x-request-id") ?? randomUUID();
  const cookieHeader = cookieStore
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");

  const requestHeaders = new Headers(init.headers);
  if (cookieHeader.length > 0) {
    requestHeaders.set("cookie", cookieHeader);
  }
  requestHeaders.set("x-request-id", requestId);

  try {
    const response = await fetch(`${backendUrl}${path}`, {
      ...init,
      headers: requestHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      logFrontendBackendRequestFailure(
        response.headers.get("x-request-id") ?? requestId,
        path,
        response.status,
      );
    }

    return response;
  } catch (error) {
    logFrontendBackendRequestFailure(
      requestId,
      path,
      undefined,
      error instanceof Error ? error.name : "unknown_error",
    );
    throw error;
  }
}
