import { frontendServerEnv } from "@/src/lib/env.server";

type HelloResponse = {
  app: string;
  message: string;
  timestamp: string;
};

async function fetchHello(): Promise<HelloResponse | null> {
  const backendUrl = frontendServerEnv.backendUrl;

  try {
    const response = await fetch(`${backendUrl}/hello`, {
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as HelloResponse;
  } catch {
    return null;
  }
}

export default async function Home() {
  const hello = await fetchHello();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <h1 className="text-4xl font-bold">Brevet Authentication Scaffold</h1>
      <p className="text-base text-zinc-600 dark:text-zinc-300">
        Use signup/login to authenticate with passkey or SIWX wallet, then manage
        login methods and CLI API keys in settings.
      </p>

      <section className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="mb-3 text-lg font-semibold">Backend /hello response</h2>
        {hello ? (
          <pre className="overflow-x-auto text-sm">
            {JSON.stringify(hello, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Backend is not reachable yet. Start <code>apps/backend</code> and
            refresh.
          </p>
        )}
      </section>
    </main>
  );
}
