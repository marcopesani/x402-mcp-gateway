"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        An unexpected error occurred. Please retry, and contact support if the issue continues.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
      >
        Try again
      </button>
    </main>
  );
}
