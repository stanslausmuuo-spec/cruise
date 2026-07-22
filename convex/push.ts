import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const subscribe = mutation({
  args: {
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) return { id: existing._id };

    return await ctx.db.insert("push_subscriptions", {
      userId: user._id,
      endpoint: args.endpoint,
      keys: args.keys,
    });
  },
});

export const unsubscribe = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const sub = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (sub && sub.userId === user._id) {
      await ctx.db.delete(sub._id);
    }

    return { success: true };
  },
});

export const getSubscriptionsByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("push_subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getSubscriptionsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const callerEmail = identity?.email;
    if (callerEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", callerEmail))
        .first();
      if (!user || (user._id !== args.userId && !user.roles.includes("admin"))) {
        return [];
      }
    }
    return await ctx.db
      .query("push_subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const removeSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (!sub) return { success: true };

    const identity = await ctx.auth.getUserIdentity();
    const callerEmail = identity?.email;
    if (callerEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", callerEmail))
        .first();
      if (!user || (sub.userId !== user._id && !user.roles.includes("admin"))) {
        throw new Error("Not authorized");
      }
    }

    await ctx.db.delete(sub._id);
    return { success: true };
  },
});
