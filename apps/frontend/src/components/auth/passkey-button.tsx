"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { backendFetchClient } from "@/src/lib/api-client.client";

type PasskeyMode = "signup" | "signin" | "link";

type Props = {
  mode: PasskeyMode;
  username?: string;
  className?: string;
};

export function PasskeyButton({ mode, username, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "signin") {
          const optionsResponse = await backendFetchClient(
            "/auth/passkey/login/options",
            {
              method: "POST",
            },
          );
          if (!optionsResponse.ok) throw new Error("Unable to create login challenge");
          const options = await optionsResponse.json();
          const credential = await startAuthentication({ optionsJSON: options });
          const verifyResponse = await backendFetchClient("/auth/passkey/login/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(credential),
          });
          if (!verifyResponse.ok) throw new Error("Passkey login failed");
        } else {
          const registerIntent = mode === "link" ? "link" : "signup";
          const optionsResponse = await backendFetchClient("/auth/passkey/register/options", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              intent: registerIntent,
              username,
            }),
          });
          if (!optionsResponse.ok) throw new Error("Unable to create registration challenge");
          const options = await optionsResponse.json();
          const credential = await startRegistration({ optionsJSON: options });
          const verifyResponse = await backendFetchClient("/auth/passkey/register/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(credential),
          });
          if (!verifyResponse.ok) throw new Error("Passkey registration failed");
        }
        router.refresh();
        router.push(mode === "link" ? "/settings/security" : "/settings/api-keys");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Passkey action failed");
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className={
          className ??
          "rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        }
      >
        {isPending
          ? "Working..."
          : mode === "signin"
            ? "Login with Passkey"
            : mode === "link"
              ? "Link Passkey"
              : "Sign up with Passkey"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
