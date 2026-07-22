import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const logEvent = internalMutation({
  args: {
    action: v.string(),
    userId: v.optional(v.id("users")),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("audit_logs", {
      action: args.action,
      userId: args.userId,
      ip: args.ip,
      userAgent: args.userAgent,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

// Public wrapper for external calls (e.g., from HTTP endpoints)
export const logEventPublic = mutation({
  args: {
    action: v.string(),
    userId: v.optional(v.id("users")),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("audit_logs", {
      action: args.action,
      userId: args.userId,
      ip: args.ip,
      userAgent: args.userAgent,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Note: this is a public query for admin use, but should be protected by admin check
    const limit = args.limit ?? 100;
    let query = ctx.db.query("audit_logs").withIndex("by_timestamp").order("desc");

    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("userId"), args.userId!));
    }

    if (args.action) {
      query = query.filter((q) => q.eq(q.field("action"), args.action!));
    }

    const page = await query.paginate({ numItems: limit, cursor: null });
    return page;
  },
});