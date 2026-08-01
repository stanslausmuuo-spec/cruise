import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

export const downgradeExpiredTiers = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Legacy: one-time migration of old featured vehicles into the tier system.
    // Old documents may still carry isFeatured/featuredExpiresAt fields.
    const legacyVehicles = (await ctx.db.query("vehicles").collect()) as Array<
      Doc<"vehicles"> & { isFeatured?: boolean; featuredExpiresAt?: number }
    >;

    for (const vehicle of legacyVehicles) {
      if (vehicle.isFeatured !== true) continue;

      const expiresAt = vehicle.featuredExpiresAt;
      if (expiresAt !== undefined && expiresAt > now) {
        // Still-active legacy featured listing — carry it into the tier system
        await ctx.db.patch(vehicle._id, {
          tier: "premium",
          tierExpiresAt: expiresAt,
        });
      } else {
        // Expired legacy flag — return to free
        await ctx.db.patch(vehicle._id, {
          tier: "free",
          tierExpiresAt: undefined,
        });
      }
    }

    // Downgrade expired paid tiers silently back to free.
    // Expiry only affects listing visibility — never an active booking.
    const expired = await ctx.db
      .query("vehicles")
      .filter((q) =>
        q.and(
          q.lt(q.field("tierExpiresAt"), now),
          q.neq(q.field("tier"), "free")
        )
      )
      .collect();

    for (const vehicle of expired) {
      await ctx.db.patch(vehicle._id, {
        tier: "free",
        tierExpiresAt: undefined,
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

export const autoExpirePendingBookings = internalMutation({
  handler: async (ctx) => {
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;

    const staleRequests = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.lt(q.field("createdAt"), fortyEightHoursAgo))
      .collect();

    for (const booking of staleRequests) {
      await ctx.db.patch(booking._id, { status: "cancelled" });

      const availabilityRecords = await ctx.db
        .query("availability")
        .withIndex("by_booking", (q) => q.eq("bookingId", booking._id))
        .collect();

      for (const record of availabilityRecords) {
        await ctx.db.delete(record._id);
      }
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
    await ctx.runMutation(internal.cron.downgradeExpiredTiers);
    await ctx.runMutation(internal.cron.autoCompleteBookings);
    await ctx.runMutation(internal.cron.autoExpirePendingBookings);
    await ctx.runMutation(internal.cron.cleanupOrphanedImages);
    await ctx.runMutation(internal.cron.cleanupFailedTransactions);
  },
});