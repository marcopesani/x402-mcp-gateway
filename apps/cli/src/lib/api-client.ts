import { randomUUID } from "node:crypto";
import { fetch, Headers, type RequestInit, type Response } from "undici";

import { getApiKey } from "./config.js";

export class BackendHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string,
    readonly path?: string,
  ) {
    super(message);
  }
}

const normalizeUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

export async function backendFetch(
  backendUrl: string,
  path: string,
  init: RequestInit = {},
  explicitApiKey?: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  const requestId = randomUUID();
  const apiKey = getApiKey(explicitApiKey);
  if (apiKey) {
    headers.set("authorization", `Bearer ${apiKey}`);
  }

  headers.set("x-request-id", requestId);

  return fetch(normalizeUrl(backendUrl, path), {
    ...init,
    headers,
  });
}

export async function fetchJsonOrThrow<T>(
  backendUrl: string,
  path: string,
  parse: (payload: unknown) => T,
  init: RequestInit = {},
  explicitApiKey?: string,
): Promise<T> {
  const response = await backendFetch(backendUrl, path, init, explicitApiKey);
  if (!response.ok) {
    throw new BackendHttpError(
      `Backend returned ${response.status}`,
      response.status,
      response.headers.get("x-request-id") ?? undefined,
      path,
    );
  }

  const payload = await response.json();
  return parse(payload);
}
