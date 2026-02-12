"use client";

import { useState } from "react";

interface McpServerUrlProps {
  userId: string;
}

export default function McpServerUrl({ userId }: McpServerUrlProps) {
  const [copied, setCopied] = useState(false);

  const mcpUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/mcp/${userId}`
      : `/api/mcp/${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = mcpUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="mb-1 text-lg font-semibold text-black dark:text-zinc-50">
        MCP Server URL
      </h2>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Use this URL to connect AI agents to your payment gateway.
      </p>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="truncate font-mono text-sm text-zinc-900 dark:text-zinc-100">
            {mcpUrl}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
