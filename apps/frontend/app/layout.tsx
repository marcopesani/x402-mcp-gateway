import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { LogoutButton } from "@/src/components/auth/logout-button";
import { Providers } from "@/src/components/providers";
import { getSessionServer } from "@/src/lib/session.server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brevet",
  description: "Brevet auth scaffold",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionServer();
  const headersData = await headers();
  const cookies = headersData.get("cookie");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers cookies={cookies}>
        <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
          <header className="border-b border-zinc-200 dark:border-zinc-800">
            <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
              <Link href="/" className="font-semibold">
                Brevet
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm hover:underline">
                  Login
                </Link>
                <Link href="/signup" className="text-sm hover:underline">
                  Signup
                </Link>
                {session.authenticated ? (
                  <>
                    <Link href="/settings/security" className="text-sm hover:underline">
                      Security
                    </Link>
                    <Link href="/settings/api-keys" className="text-sm hover:underline">
                      API Keys
                    </Link>
                    <LogoutButton />
                  </>
                ) : null}
              </div>
            </nav>
          </header>
          {children}
        </div>
        </Providers>
      </body>
    </html>
  );
}
