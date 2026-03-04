import { redirect } from "next/navigation";
import { listApiKeysResponseSchema } from "@repo/auth-contracts/apiKeys";
import { ApiKeysManager } from "@/src/components/auth/api-keys-manager";
import { backendFetchServer } from "@/src/lib/api-client.server";
import { getSessionServer } from "@/src/lib/session.server";

async function getApiKeys() {
  const response = await backendFetchServer("/auth/api-keys");
  if (!response.ok) {
    return listApiKeysResponseSchema.parse({ items: [] });
  }
  return listApiKeysResponseSchema.parse(await response.json());
}

export default async function ApiKeysPage() {
  const [session, keys] = await Promise.all([getSessionServer(), getApiKeys()]);
  if (!session.authenticated) {
    redirect("/unauthorized");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <h1 className="text-3xl font-bold">API Keys</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        Issue and revoke API keys for CLI authentication.
      </p>
      <ApiKeysManager initialItems={keys.items} />
    </main>
  );
}
