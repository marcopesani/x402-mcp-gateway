"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutClient } from "@/src/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await logoutClient();
          router.push("/login");
          router.refresh();
        });
      }}
      disabled={isPending}
      className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}
