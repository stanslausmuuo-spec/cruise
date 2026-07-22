import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { checkRateLimit } from "./lib/rateLimit";

export const check = mutation({
  args: {
    key: v.string(),
    maxRequests: v.optional(v.number()),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await checkRateLimit(ctx.db, args.key, args.maxRequests, args.windowMs);
  },
});
