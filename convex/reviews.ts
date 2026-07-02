import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    type: v.union(v.literal("guest_to_host"), v.literal("host_to_guest")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reviews", {
      bookingId: args.bookingId,
      reviewerId: args.reviewerId,
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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId))
      .collect();
  },
});

export const getBookingReviews = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();
  },
});
