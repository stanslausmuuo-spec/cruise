import { mutation } from "./_generated/server";

export const expireFeaturedListings = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("vehicles")
      .filter((q) =>
        q.and(
          q.eq(q.field("isFeatured"), true),
          q.lt(q.field("featuredExpiresAt"), now)
        )
      )
      .collect();

    for (const vehicle of expired) {
      await ctx.db.patch(vehicle._id, {
        isFeatured: false,
        featuredExpiresAt: undefined,
        featuredCategory: undefined,
      });
    }
  },
});

export const autoCompleteBookings = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    for (const booking of activeBookings) {
      if (booking.endDate < now) {
        await ctx.db.patch(booking._id, { status: "completed" });
      }
    }
  },
});
