import { redirect } from "next/navigation";
import { PasskeyButton } from "@/src/components/auth/passkey-button";
import { WalletConnectButton } from "@/src/components/auth/walletconnect-button";
import { isAuthenticatedServer } from "@/src/lib/session.server";

export default async function SignupPage() {
  if (await isAuthenticatedServer()) {
    redirect("/settings/security");
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Signup</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        Create an account with passkey or wallet (SIWX).
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <PasskeyButton mode="signup" />
        <WalletConnectButton intent="signin" />
      </div>
    </main>
  );
}
