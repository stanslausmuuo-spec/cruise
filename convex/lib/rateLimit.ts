import type { DatabaseWriter } from "../_generated/server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

export async function checkRateLimit(
  db: DatabaseWriter,
  key: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();

  const existing = await db
    .query("rate_limits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  if (!existing || existing.resetTime < now) {
    await db.insert("rate_limits", {
      key,
      count: 1,
      resetTime: now + windowMs,
      createdAt: now,
    });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }

  await db.patch(existing._id, { count: existing.count + 1 });

  return {
    allowed: true,
    remaining: maxRequests - existing.count - 1,
    resetTime: existing.resetTime,
  };
}
