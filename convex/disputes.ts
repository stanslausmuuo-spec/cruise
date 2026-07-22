import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const createDispute = mutation({
  args: {
    bookingId: v.id("bookings"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== user._id && booking.hostId !== user._id) {
      throw new Error("Not authorized to dispute this booking");
    }
    if (booking.status !== "active") {
      throw new Error("Can only dispute active bookings");
    }

    const existing = await ctx.db
      .query("disputes")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .first();
    if (existing) throw new Error("Dispute already exists for this booking");

    if (args.reason.length > 5000) throw new Error("Reason too long");

    await ctx.db.insert("disputes", {
      bookingId: args.bookingId,
      raisedById: user._id,
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
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");

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
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");
    
    return await ctx.db
      .query("disputes")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
  },
});