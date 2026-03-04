import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        You need to log in to continue.
      </p>
      <Link href="/login" className="text-sm underline">
        Go to login
      </Link>
    </main>
  );
}
