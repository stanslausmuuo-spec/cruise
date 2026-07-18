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

export const createPayToReveal = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    amount: v.number(),
    phoneNumber: v.string(),
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    await ctx.db.insert("reveals", {
      userId: user._id,
      vehicleId: args.vehicleId,
      amount: args.amount,
      checkoutRequestId: args.checkoutRequestId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "pay_to_reveal",
      amount: args.amount,
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
    const reveal = await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!reveal) throw new Error("Reveal record not found");

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
    return await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();
  },
});

export const getRevealWithOwnerPhone = query({
  args: { checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    const reveal = await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!reveal || !reveal.mobileMoneyRef) return null;

    const vehicle = await ctx.db.get(reveal.vehicleId);
    if (!vehicle) return null;

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
    amount: v.number(),
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

    const startDate = Date.now();
    const endDate = startDate + args.durationDays * 86400000;

    await ctx.db.insert("featured_listings", {
      vehicleId: args.vehicleId,
      ownerId: user._id,
      amount: args.amount,
      startDate,
      endDate,
      category: args.category,
      active: false, // Will be activated on payment confirmation
      checkoutRequestId: args.checkoutRequestId,
    });

    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "featured_listing",
      amount: args.amount,
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
    const featured = await ctx.db
      .query("featured_listings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!featured) throw new Error("Featured listing not found");

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
    return await ctx.db
      .query("featured_listings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();
  },
});

export const getBookingByMpesaRef = query({
  args: { mobileMoneyRef: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("mobileMoneyRef"), args.mobileMoneyRef))
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
    
    // Get all completed booking payment transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("type", "booking_payment"))
      .order("desc")
      .collect();

    const completed = transactions.filter((t) => t.status === "completed");
    const pending = transactions.filter((t) => t.status === "pending");
    
    // Calculate total earnings
    const totalEarnings = completed.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate this month's earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thisMonthEarnings = completed
      .filter((t) => t.createdAt >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate pending payouts (completed but not yet paid out
    const pendingPayouts = completed
      .filter((t) => !t.metadata?.payoutCompleted)
      .reduce((sum, t) => sum + t.amount, 0);

    // Get earnings by month for the last 12 months
    const monthlyEarnings = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1).getTime();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
      
      const monthEarnings = completed
        .filter((t) => t.createdAt >= monthStart && t.createdAt < monthEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyEarnings.push({
        month: new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString("default", { month: "short", year: "2-digit" }),
        earnings: monthEarnings,
      });
    }

    // Pending payouts (completed transactions not yet paid out to host)
    const pendingPayoutTransactions = completed.filter((t) => !t.metadata?.payoutCompleted);

    return {
      totalEarnings,
      thisMonthEarnings,
      pendingPayouts: pendingPayouts,
      pendingPayoutCount: pendingPayoutTransactions.length,
      monthlyEarnings,
      recentTransactions: completed.slice(0, 20),
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