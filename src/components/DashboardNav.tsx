"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Wallet & Policies", href: "/dashboard" },
  { label: "Hot Wallet", href: "/dashboard/wallet" },
  { label: "History", href: "/dashboard/history" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              isActive
                ? "border-b-2 border-black px-1 pb-2 text-sm font-medium text-black dark:border-zinc-50 dark:text-zinc-50"
                : "border-b-2 border-transparent px-1 pb-2 text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
