import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

async function getCurrentUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .first();
  
  if (!user) throw new Error("User not found");
  return user;
}

export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    type: v.union(v.literal("guest_to_host"), v.literal("host_to_guest")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== user._id && booking.hostId !== user._id) {
      throw new Error("Not authorized to review this booking");
    }
    
    // Prevent duplicate reviews
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .filter((q) => q.eq(q.field("reviewerId"), user._id))
      .first();
    
    if (existing) throw new Error("Already reviewed this booking");

    await ctx.db.insert("reviews", {
      bookingId: args.bookingId,
      reviewerId: user._id,
      revieweeId: args.revieweeId,
      rating: args.rating,
      comment: args.comment,
      type: args.type,
      createdAt: Date.now(),
    });

    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.revieweeId))
      .collect();

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ctx.db.patch(args.revieweeId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });
  },
});

export const getUserReviews = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", user._id))
      .collect();
  },
});

export const getBookingReviews = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== user._id && booking.hostId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }
    
    return await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();
  },
});