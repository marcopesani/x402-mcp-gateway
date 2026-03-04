import "server-only";
import { sessionResponseSchema, type SessionResponse } from "@repo/auth-contracts/auth";
import { backendFetchServer } from "@/src/lib/api-client.server";

const anonymousSession = sessionResponseSchema.parse({
  authenticated: false,
  user: null,
  methods: [],
});

export async function getSessionServer(): Promise<SessionResponse> {
  try {
    const response = await backendFetchServer("/auth/session");
    if (!response.ok) {
      return anonymousSession;
    }

    return sessionResponseSchema.parse(await response.json());
  } catch {
    return anonymousSession;
  }
}

export async function isAuthenticatedServer(): Promise<boolean> {
  const session = await getSessionServer();
  return session.authenticated;
}
