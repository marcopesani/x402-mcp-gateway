import { redirect } from "next/navigation";
import { MethodsManager } from "@/src/components/auth/methods-manager";
import { getSessionServer } from "@/src/lib/session.server";

export default async function SecurityPage() {
  const session = await getSessionServer();
  if (!session.authenticated) {
    redirect("/unauthorized");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <h1 className="text-3xl font-bold">Security</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        Manage your login methods. At least one method must remain linked.
      </p>
      <MethodsManager methods={session.methods} />
    </main>
  );
}
