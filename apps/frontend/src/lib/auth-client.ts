"use client";

import type {
  SiwxChallengeRequest,
  SiwxChallengeResponse,
  SiwxVerifyRequest,
} from "@repo/auth-contracts/siwx";
import type { SessionResponse } from "@repo/auth-contracts/auth";
import {
  issueApiKeyResponseSchema,
  listApiKeysResponseSchema,
} from "@repo/auth-contracts/apiKeys";
import {
  siwxChallengeResponseSchema,
  siwxVerifyResponseSchema,
} from "@repo/auth-contracts/siwx";
import { sessionResponseSchema } from "@repo/auth-contracts/auth";
import { backendFetchClient } from "./api-client.client";

export async function getSessionClient(): Promise<SessionResponse> {
  const response = await backendFetchClient("/auth/session");
  return sessionResponseSchema.parse(await response.json());
}

export async function logoutClient(): Promise<void> {
  await backendFetchClient("/auth/logout", {
    method: "POST",
  });
}

export async function requestSiwxChallenge(
  payload: SiwxChallengeRequest,
): Promise<SiwxChallengeResponse> {
  const response = await backendFetchClient("/auth/siwx/challenge", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to create SIWX challenge");
  }
  return siwxChallengeResponseSchema.parse(await response.json());
}

export async function verifySiwx(payload: SiwxVerifyRequest): Promise<void> {
  const response = await backendFetchClient("/auth/siwx/verify", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("SIWX verification failed");
  }
  siwxVerifyResponseSchema.parse(await response.json());
}

export async function unlinkMethod(methodId: string): Promise<void> {
  const response = await backendFetchClient("/auth/methods/unlink", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ methodId }),
  });
  if (!response.ok) {
    throw new Error("Unable to unlink method");
  }
}

export async function listApiKeys(): Promise<{
  items: Array<{
    id: string;
    name: string;
    prefix: string;
    revokedAt: string | null;
    createdAt: string;
  }>;
}> {
  const response = await backendFetchClient("/auth/api-keys");
  if (!response.ok) {
    throw new Error("Unable to load api keys");
  }
  return listApiKeysResponseSchema.parse(await response.json());
}

export async function issueApiKey(name: string): Promise<{
  id: string;
  key: string;
  prefix: string;
  createdAt: string;
}> {
  const response = await backendFetchClient("/auth/api-keys", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Unable to issue api key");
  }
  return issueApiKeyResponseSchema.parse(await response.json());
}

export async function revokeApiKey(id: string): Promise<void> {
  const response = await backendFetchClient(`/auth/api-keys/${id}/revoke`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Unable to revoke api key");
  }
}
