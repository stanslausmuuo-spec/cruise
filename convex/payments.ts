import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const createPayToReveal = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    phoneNumber: v.string(),
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Server-calculated amount — client cannot set price
    const amount = 500; // PAY_TO_REVEAL_FEE in KES
    
    await ctx.db.insert("reveals", {
      userId: user._id,
      vehicleId: args.vehicleId,
      amount,
      checkoutRequestId: args.checkoutRequestId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "pay_to_reveal",
      amount,
      currency: "KES",
      reference: args.checkoutRequestId,
      status: "pending",
      metadata: { vehicleId: args.vehicleId },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const confirmPayToReveal = mutation({
  args: {
    checkoutRequestId: v.string(),
    mobileMoneyRef: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reveal = await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!reveal) throw new Error("Reveal record not found");

    // Only the reveal owner or an admin can confirm
    if (reveal.userId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }

    // Idempotency: skip if already confirmed
    if (reveal.mobileMoneyRef) {
      return { success: true };
    }

    await ctx.db.patch(reveal._id, { mobileMoneyRef: args.mobileMoneyRef });

    // Update transaction to completed
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.checkoutRequestId))
      .first();

    if (transaction) {
      await ctx.db.patch(transaction._id, {
        status: "completed",
        metadata: { ...transaction.metadata, mobileMoneyRef: args.mobileMoneyRef },
      });
    }

    return { success: true };
  },
});

export const getRevealByCheckoutRequestId = query({
  args: { checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);

    return await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();
  },
});

export const getRevealWithOwnerPhone = query({
  args: { checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reveal = await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!reveal || !reveal.mobileMoneyRef) return null;

    // Only the reveal requester or an admin may view the phone
    if (reveal.userId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }

    const vehicle = await ctx.db.get(reveal.vehicleId);
    if (!vehicle) return null;

    // Only return the phone if the requester has an active (paid) booking for this vehicle
    if (!user.roles.includes("admin")) {
      const booking = await ctx.db
        .query("bookings")
        .withIndex("by_vehicle", (q) => q.eq("vehicleId", vehicle._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("guestId"), user._id),
            q.eq(q.field("paymentStatus"), "paid")
          )
        )
        .first();

      if (!booking) {
        throw new Error("Not authorized: no active booking for this vehicle");
      }
    }

    const owner = await ctx.db.get(vehicle.ownerId);
    if (!owner) return null;

    return {
      revealed: true,
      phone: owner.phone,
      mobileMoneyRef: reveal.mobileMoneyRef,
    };
  },
});

export const createFeaturedPayment = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    durationDays: v.number(),
    category: v.optional(v.string()),
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Verify user owns the vehicle
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.ownerId !== user._id) throw new Error("Not authorized");

    // Server-calculated amount — client cannot set price
    const amount = 2000; // FEATURED_LISTING_FEE in KES

    const startDate = Date.now();
    const endDate = startDate + args.durationDays * 86400000;

    await ctx.db.insert("featured_listings", {
      vehicleId: args.vehicleId,
      ownerId: user._id,
      amount,
      startDate,
      endDate,
      category: args.category,
      active: false, // Will be activated on payment confirmation
      checkoutRequestId: args.checkoutRequestId,
    });

    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "featured_listing",
      amount,
      currency: "KES",
      reference: args.checkoutRequestId,
      status: "pending",
      metadata: { vehicleId: args.vehicleId, durationDays: args.durationDays, category: args.category },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const confirmFeaturedPayment = mutation({
  args: {
    checkoutRequestId: v.string(),
    mobileMoneyRef: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const featured = await ctx.db
      .query("featured_listings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!featured) throw new Error("Featured listing not found");

    // Only the owner or an admin can confirm
    if (featured.ownerId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }

    // Idempotency: skip if already active
    if (featured.active) {
      return { success: true };
    }

    await ctx.db.patch(featured._id, {
      active: true,
      mobileMoneyRef: args.mobileMoneyRef,
    });

    // Update transaction to completed
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.checkoutRequestId))
      .first();

    if (transaction) {
      await ctx.db.patch(transaction._id, {
        status: "completed",
        metadata: { ...transaction.metadata, mobileMoneyRef: args.mobileMoneyRef },
      });
    }

    // Update vehicle to be featured
    await ctx.db.patch(featured.vehicleId, {
      isFeatured: true,
      featuredExpiresAt: featured.endDate,
      featuredCategory: featured.category,
    });

    return { success: true };
  },
});

export const getFeaturedByCheckoutRequestId = query({
  args: { checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);

    return await ctx.db
      .query("featured_listings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();
  },
});

export const getBookingByMpesaRef = query({
  args: { mobileMoneyRef: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);

    return await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("mobileMoneyRef"), args.mobileMoneyRef))
      .first();
  },
});

export const getTransactionByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();
  },
});

export const updateTransactionStatus = mutation({
  args: {
    reference: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();

    if (!transaction) {
      throw new Error("Transaction not found");
    }
    
    // Only allow admin or transaction owner to update
    if (transaction.userId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }

    // Only admins can mark a transaction as completed
    if (args.status === "completed" && !user.roles.includes("admin")) {
      throw new Error("Only admins can mark transactions as completed");
    }

    await ctx.db.patch(transaction._id, {
      status: args.status,
      metadata: args.metadata,
    });
  },
});

export const getUserTransactions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getHostEarnings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    // Get completed bookings where this user is the host
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_host", (q) => q.eq("hostId", user._id))
      .order("desc")
      .collect();

    const completedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "active" || b.status === "completed");
    const pendingBookings = bookings.filter((b) => b.status === "pending");

    // Host earnings = totalAmount - platformFee from each completed booking
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalAmount - b.platformFee), 0);
    
    // Calculate this month's earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thisMonthEarnings = completedBookings
      .filter((b) => b.createdAt >= startOfMonth)
      .reduce((sum, b) => sum + (b.totalAmount - b.platformFee), 0);
    
    // Pending payouts = pending bookings' host earnings (waiting for payment confirmation)
    const pendingPayouts = pendingBookings.reduce((sum, b) => sum + (b.totalAmount - b.platformFee), 0);

    // Get earnings by month for the last 12 months
    const monthlyEarnings = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1).getTime();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
      
      const monthEarnings = completedBookings
        .filter((b) => b.createdAt >= monthStart && b.createdAt < monthEnd)
        .reduce((sum, b) => sum + (b.totalAmount - b.platformFee), 0);
      
      monthlyEarnings.push({
        month: new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString("default", { month: "short", year: "2-digit" }),
        earnings: monthEarnings,
      });
    }

    // Recent completed bookings for the table
    const recentBookings = completedBookings.slice(0, 20);

    return {
      totalEarnings,
      thisMonthEarnings,
      pendingPayouts,
      pendingPayoutCount: pendingBookings.length,
      monthlyEarnings,
      recentBookings,
    };
  },
});

export const markPayoutCompleted = mutation({
  args: {
    transactionIds: v.array(v.id("transactions")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");

    for (const transactionId of args.transactionIds) {
      const transaction = await ctx.db.get(transactionId);
      await ctx.db.patch(transactionId, {
        metadata: { ...(transaction?.metadata || {}), payoutCompleted: true },
      });
    }

    return { success: true };
  },
});