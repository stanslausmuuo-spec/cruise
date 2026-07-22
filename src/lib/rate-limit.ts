/**
 * In-memory rate limiter — best-effort for serverless/edge environments.
 *
 * LIMITATIONS:
 * - Resets on cold start (each new isolate gets a fresh Map).
 * - No cross-instance coordination; each isolate counts independently.
 * - For durable rate limiting, a Convex-based approach exists at convex/rateLimit.ts
 *   but requires a round-trip. Use this in-memory limiter for fast first-pass
 *   checks in middleware/edge, and consider adding Convex-based checks for
 *   higher security requirements.
 *
 * For auth endpoints these limits are intentionally conservative to mitigate
 * brute-force attacks even with cold-start resets.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 attempts per 15 min window per key
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

let lastCleanup = Date.now();

function cleanup(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

export function authRateLimit(
  key: string,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();

  cleanup(now);

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + WINDOW_MS;
    store.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

export function clearRateLimit(key: string): void {
  store.delete(key);
}
