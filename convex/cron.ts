import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";

export const expireFeaturedListings = internalMutation({
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

export const autoCompleteBookings = internalMutation({
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

export const releaseDeposits = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;
    
    const completedBookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .filter((q) => q.lt(q.field("checkOutTime"), fortyEightHoursAgo))
      .collect();

    for (const booking of completedBookings) {
      // Release deposit back to guest
      await ctx.db.insert("transactions", {
        userId: booking.guestId,
        type: "deposit_release",
        amount: booking.depositAmount,
        currency: "KES",
        reference: `DEP-REL-${Date.now()}`,
        status: "completed",
        createdAt: Date.now(),
      });
      
      // Release platform fee to host (minus deposit if already paid)
      await ctx.db.insert("transactions", {
        userId: booking.hostId,
        type: "payout",
        amount: booking.totalAmount - booking.platformFee - booking.depositAmount,
        currency: "KES",
        reference: `PAYOUT-${Date.now()}`,
        status: "completed",
        createdAt: Date.now(),
      });
    }
  },
});

export const cleanupOrphanedImages = internalMutation({
  handler: async (ctx) => {
    // Find vehicles that have been deleted but still have images referenced
    // This is a placeholder - actual implementation depends on file storage approach
    // For now, we can clean up vehicles with empty image arrays that are inactive
    const inactiveVehicles = await ctx.db
      .query("vehicles")
      .filter((q) => q.and(
        q.eq(q.field("isActive"), false),
        q.eq(q.field("images"), [])
      ))
      .collect();

    for (const vehicle of inactiveVehicles) {
      // Delete completely if inactive and no images for > 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (vehicle.createdAt < thirtyDaysAgo) {
        await ctx.db.delete(vehicle._id);
      }
    }
  },
});

export const cleanupExpiredReveals = internalMutation({
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const oldReveals = await ctx.db
      .query("reveals")
      .filter((q) => q.lt(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    for (const reveal of oldReveals) {
      await ctx.db.delete(reveal._id);
    }
  },
});

export const cleanupFailedTransactions = internalMutation({
  handler: async (ctx) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const failedTransactions = await ctx.db
      .query("transactions")
      .filter((q) => q.and(
        q.eq(q.field("status"), "pending"),
        q.lt(q.field("createdAt"), oneHourAgo)
      ))
      .collect();

    for (const tx of failedTransactions) {
      await ctx.db.patch(tx._id, { status: "failed" });
    }
  },
});

export const dailyCleanup = internalAction({
  handler: async (ctx) => {
    await ctx.runMutation(internal.cron.expireFeaturedListings);
    await ctx.runMutation(internal.cron.autoCompleteBookings);
    await ctx.runMutation(internal.cron.releaseDeposits);
    await ctx.runMutation(internal.cron.cleanupOrphanedImages);
    await ctx.runMutation(internal.cron.cleanupExpiredReveals);
    await ctx.runMutation(internal.cron.cleanupFailedTransactions);
  },
});