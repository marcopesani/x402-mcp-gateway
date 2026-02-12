import { NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Simple in-memory sliding window rate limiter.
 *
 * @param key       Unique key for the rate limit bucket (e.g. IP address)
 * @param limit     Max number of requests allowed in the window
 * @param windowMs  Window size in milliseconds (default: 60 seconds)
 * @returns null if allowed, or a NextResponse with 429 status if rate limited
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000,
): NextResponse | null {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(windowMs / 1000)),
        },
      },
    );
  }

  entry.timestamps.push(now);
  return null;
}

/**
 * Extract a client identifier from a request for rate limiting.
 * Uses x-forwarded-for header or falls back to a default key.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
