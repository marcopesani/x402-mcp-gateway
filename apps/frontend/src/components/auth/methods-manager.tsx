"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { unlinkMethod } from "@/src/lib/auth-client";
import { PasskeyButton } from "./passkey-button";
import { WalletConnectButton } from "./walletconnect-button";

type MethodItem = {
  id: string;
  type: "passkey" | "wallet";
  label: string;
  createdAt: string;
};

type Props = {
  methods: MethodItem[];
};

export function MethodsManager({ methods }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onUnlink = (methodId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await unlinkMethod(methodId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to unlink");
      }
    });
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <PasskeyButton mode="link" />
        <WalletConnectButton intent="link" />
      </div>

      <div className="space-y-2">
        {methods.map((method) => (
          <article
            key={method.id}
            className="flex items-center justify-between rounded-md border border-zinc-300 p-3 dark:border-zinc-700"
          >
            <div>
              <p className="font-medium">{method.label}</p>
              <p className="text-xs text-zinc-500">
                {method.type} - added {new Date(method.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUnlink(method.id)}
              disabled={isPending}
              className="rounded-md border border-red-400 px-3 py-1 text-sm text-red-600 disabled:opacity-60"
            >
              Remove
            </button>
          </article>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
