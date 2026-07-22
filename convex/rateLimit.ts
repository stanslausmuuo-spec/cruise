import { v } from "convex/values";
import { mutation } from "./_generated/server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

export const check = mutation({
  args: {
    key: v.string(),
    maxRequests: v.optional(v.number()),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxRequests = args.maxRequests ?? MAX_REQUESTS;
    const windowMs = args.windowMs ?? WINDOW_MS;
    const now = Date.now();
    const windowStart = now - windowMs;

    const existing = await ctx.db
      .query("rate_limits")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!existing || existing.resetTime < now) {
      await ctx.db.insert("rate_limits", {
        key: args.key,
        count: 1,
        resetTime: now + windowMs,
        createdAt: now,
      });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: existing.resetTime };
    }

    await ctx.db.patch(existing._id, { count: existing.count + 1 });

    return {
      allowed: true,
      remaining: maxRequests - existing.count - 1,
      resetTime: existing.resetTime,
    };
  },
});
