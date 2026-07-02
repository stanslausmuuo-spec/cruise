import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPayToReveal = mutation({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    amount: v.number(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reveals", {
      userId: args.userId,
      vehicleId: args.vehicleId,
      amount: args.amount,
      createdAt: Date.now(),
    });

    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "pay_to_reveal",
      amount: args.amount,
      currency: "KES",
      reference: `REV-${Date.now()}`,
      status: "completed",
      createdAt: Date.now(),
    });
  },
});

export const createFeaturedPayment = mutation({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    amount: v.number(),
    durationDays: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startDate = Date.now();
    const endDate = startDate + args.durationDays * 86400000;

    await ctx.db.insert("featured_listings", {
      vehicleId: args.vehicleId,
      ownerId: args.userId,
      amount: args.amount,
      startDate,
      endDate,
      category: args.category,
      active: true,
    });

    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "featured_listing",
      amount: args.amount,
      currency: "KES",
      reference: `FTR-${Date.now()}`,
      status: "completed",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.vehicleId, {
      isFeatured: true,
      featuredExpiresAt: endDate,
      featuredCategory: args.category,
    });
  },
});

export const getUserTransactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
