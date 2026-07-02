import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createDispute = mutation({
  args: {
    bookingId: v.id("bookings"),
    raisedById: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("disputes", {
      bookingId: args.bookingId,
      raisedById: args.raisedById,
      reason: args.reason,
      status: "open",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.bookingId, { status: "disputed" });
  },
});

export const resolveDispute = mutation({
  args: {
    disputeId: v.id("disputes"),
    resolution: v.string(),
    resolutionType: v.union(
      v.literal("host_refund"),
      v.literal("guest_refund"),
      v.literal("partial_split"),
      v.literal("no_fault")
    ),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.disputeId, {
      status: "resolved",
      resolution: args.resolution,
      resolutionType: args.resolutionType,
      adminNotes: args.adminNotes,
      resolvedAt: Date.now(),
    });

    const dispute = await ctx.db.get(args.disputeId);
    if (dispute) {
      await ctx.db.patch(dispute.bookingId, { status: "completed" });
    }
  },
});

export const getOpenDisputes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("disputes")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
  },
});
