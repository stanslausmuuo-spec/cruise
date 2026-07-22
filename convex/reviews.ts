import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== user._id && booking.hostId !== user._id) {
      throw new Error("Not authorized to review this booking");
    }
    if (booking.status !== "completed" && booking.status !== "confirmed") {
      throw new Error("Can only review completed bookings");
    }
    
    const isHost = booking.hostId === user._id;
    const revieweeId = isHost ? booking.guestId : booking.hostId;
    
    if (revieweeId === user._id) throw new Error("Cannot review yourself");
    
    const type = isHost ? "host_to_guest" : "guest_to_host";
    
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .filter((q) => q.eq(q.field("reviewerId"), user._id))
      .first();
    
    if (existing) throw new Error("Already reviewed this booking");

    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be between 1 and 5");
    if (args.comment.length > 2000) throw new Error("Comment too long");

    await ctx.db.insert("reviews", {
      bookingId: args.bookingId,
      reviewerId: user._id,
      revieweeId,
      rating: args.rating,
      comment: args.comment,
      type,
      createdAt: Date.now(),
    });

    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", revieweeId))
      .collect();

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ctx.db.patch(revieweeId, {
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