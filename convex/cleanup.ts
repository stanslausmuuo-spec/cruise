import { mutation } from "./_generated/server";

export const cleanupOldData = mutation({
  handler: async (ctx) => {
    const oldBookings = await ctx.db.query("bookings").collect();
    for (const b of oldBookings) {
      if ("carId" in b || "carMake" in b) {
        await ctx.db.delete(b._id);
      }
    }

    const oldUsers = await ctx.db.query("users").collect();
    for (const u of oldUsers) {
      if ("email" in u && !("roles" in (u as Record<string, unknown>))) {
        await ctx.db.delete(u._id);
      }
    }

    return { cleaned: true };
  },
});
