import { mutation } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const cleanupOldData = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Admin only");
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
