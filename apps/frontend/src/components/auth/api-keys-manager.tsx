"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { issueApiKey, revokeApiKey } from "@/src/lib/auth-client";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  revokedAt: string | null;
  createdAt: string;
};

type Props = {
  initialItems: ApiKey[];
};

export function ApiKeysManager({ initialItems }: Props) {
  const router = useRouter();
  const [name, setName] = useState("CLI key");
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onIssue = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const response = await issueApiKey(name);
        setIssuedKey(response.key);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to issue key");
      }
    });
  };

  const onRevoke = (id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await revokeApiKey(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to revoke key");
      }
    });
  };

  return (
    <section className="space-y-6">
      <form onSubmit={onIssue} className="space-y-2 rounded-md border border-zinc-300 p-4 dark:border-zinc-700">
        <label className="block text-sm font-medium" htmlFor="name">
          Key name
        </label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {isPending ? "Issuing..." : "Issue API key"}
        </button>
      </form>

      {issuedKey ? (
        <div className="rounded-md border border-emerald-400 bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <p className="font-medium">Copy this key now. It is shown once.</p>
          <code className="block overflow-x-auto">{issuedKey}</code>
        </div>
      ) : null}

      <div className="space-y-2">
        {initialItems.map((item) => (
          <article
            key={item.id}
            className="flex items-center justify-between rounded-md border border-zinc-300 p-3 dark:border-zinc-700"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-zinc-500">
                prefix {item.prefix} - {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            {item.revokedAt ? (
              <span className="text-xs text-zinc-500">revoked</span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => onRevoke(item.id)}
                className="rounded-md border border-red-400 px-3 py-1 text-sm text-red-600 disabled:opacity-60"
              >
                Revoke
              </button>
            )}
          </article>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
