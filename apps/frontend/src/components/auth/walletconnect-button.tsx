"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { signInWithSiwx } from "@/src/lib/siwx";

type Props = {
  intent: "signin" | "link";
  className?: string;
};

export function WalletConnectButton({ intent, className }: Props) {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pendingIntentRef = useRef<"signin" | "link" | null>(null);

  const runSignIn = (targetIntent: "signin" | "link") => {
    setError(null);
    startTransition(async () => {
      try {
        await signInWithSiwx(targetIntent);
        pendingIntentRef.current = null;
        router.refresh();
        router.push(
          targetIntent === "link" ? "/settings/security" : "/settings/api-keys",
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Wallet sign in failed",
        );
      }
    });
  };

  useEffect(() => {
    if (isConnected && address && pendingIntentRef.current) {
      const targetIntent = pendingIntentRef.current;
      pendingIntentRef.current = null;
      runSignIn(targetIntent);
    }
  }, [isConnected, address]);

  const onClick = () => {
    if (isConnected && address) {
      runSignIn(intent);
      return;
    }
    pendingIntentRef.current = intent;
    open();
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-testid={
          intent === "link"
            ? "walletconnect-link-button"
            : "walletconnect-signin-button"
        }
        onClick={onClick}
        disabled={isPending}
        className={
          className ??
          "rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        }
      >
        {isPending
          ? "Working..."
          : intent === "link"
            ? "Link Wallet (SIWX)"
            : "Continue with Wallet (SIWX)"}
      </button>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
