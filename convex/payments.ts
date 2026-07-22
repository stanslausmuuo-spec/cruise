import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { api, internal } from "./_generated/api";

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
    if (!user.roles.includes("admin")) throw new Error("Admin only");

    const reveal = await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!reveal) throw new Error("Reveal record not found");

    if (reveal.mobileMoneyRef) {
      return { success: true };
    }

    await ctx.db.patch(reveal._id, { mobileMoneyRef: args.mobileMoneyRef });

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
    const user = await getCurrentUser(ctx);

    const reveal = await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!reveal) return null;
    if (reveal.userId !== user._id && !user.roles.includes("admin")) return null;

    return reveal;
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
    if (!user.roles.includes("admin")) throw new Error("Admin only");

    const featured = await ctx.db
      .query("featured_listings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!featured) throw new Error("Featured listing not found");

    if (featured.active) {
      return { success: true };
    }

    await ctx.db.patch(featured._id, {
      active: true,
      mobileMoneyRef: args.mobileMoneyRef,
    });

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
    const user = await getCurrentUser(ctx);

    const featured = await ctx.db
      .query("featured_listings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!featured) return null;
    if (featured.ownerId !== user._id && !user.roles.includes("admin")) return null;

    return featured;
  },
});

export const getBookingByMpesaRef = query({
  args: { mobileMoneyRef: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const booking = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("mobileMoneyRef"), args.mobileMoneyRef))
      .first();

    if (!booking) return null;
    if (booking.guestId !== user._id && booking.hostId !== user._id && !user.roles.includes("admin")) return null;

    return booking;
  },
});

export const getTransactionByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();

    if (!transaction) return null;
    if (transaction.userId !== user._id && !user.roles.includes("admin")) return null;

    return transaction;
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

    // Only admins can change status directly
    if (!user.roles.includes("admin")) {
      throw new Error("Only admins can update transaction status");
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

export const processMpesaCallback = mutation({
  args: {
    checkoutRequestId: v.string(),
    mpesaReceipt: v.string(),
    amount: v.number(),
    phone: v.string(),
    resultCode: v.number(),
    resultDesc: v.string(),
    callbackSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const { checkoutRequestId, mpesaReceipt, amount, phone, resultCode, resultDesc, callbackSecret } = args;

    if (callbackSecret !== process.env.MPESA_CALLBACK_SECRET) {
      throw new Error("Unauthorized: invalid callback secret");
    }

    if (resultCode !== 0) {
      const transaction = await ctx.db
        .query("transactions")
        .withIndex("by_reference", (q) => q.eq("reference", checkoutRequestId))
        .first();

      if (transaction) {
        await ctx.db.patch(transaction._id, {
          status: "failed",
          metadata: { resultCode, resultDesc },
        });
      }
      return { success: true };
    }

    // Idempotency check
    const existingTx = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", checkoutRequestId))
      .first();

    if (existingTx && existingTx.status === "completed") {
      return { success: true };
    }

    // Try booking payment
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", checkoutRequestId))
      .first();

    if (booking) {
      if (booking.status !== "pending") {
        return { success: true };
      }

      if (Math.abs(amount - booking.totalAmount) > 1) {
        return { success: false, reason: "amount_mismatch" };
      }

      await ctx.db.patch(booking._id, {
        status: "confirmed",
        paymentStatus: "paid",
        mobileMoneyRef: mpesaReceipt,
      });

      if (existingTx) {
        await ctx.db.patch(existingTx._id, {
          status: "completed",
          metadata: { mpesaReceipt, phone, amount },
        });
      }

      await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
        userId: booking.hostId,
        title: "New Booking!",
        body: `A vehicle has been booked for KES ${amount}.`,
        url: "/dashboard/host/vehicles",
      });

      return { success: true };
    }

    // Try reveal payment
    const reveal = await ctx.db
      .query("reveals")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", checkoutRequestId))
      .first();

    if (reveal) {
      if (reveal.mobileMoneyRef) {
        return { success: true };
      }

      const expectedRevealAmount = 500;
      if (Math.abs(amount - expectedRevealAmount) > 1) {
        return { success: false, reason: "amount_mismatch" };
      }

      await ctx.db.patch(reveal._id, { mobileMoneyRef: mpesaReceipt });

      if (existingTx) {
        await ctx.db.patch(existingTx._id, {
          status: "completed",
          metadata: { ...existingTx.metadata, mobileMoneyRef: mpesaReceipt },
        });
      }

      await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
        userId: reveal.userId,
        title: "Contact Revealed",
        body: `Payment of KES ${amount} successful.`,
        url: "/messages",
      });

      return { success: true };
    }

    // Try featured listing payment
    const featured = await ctx.db
      .query("featured_listings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", checkoutRequestId))
      .first();

    if (featured) {
      if (featured.active) {
        return { success: true };
      }

      const expectedFeaturedAmount = 2000;
      if (Math.abs(amount - expectedFeaturedAmount) > 1) {
        return { success: false, reason: "amount_mismatch" };
      }

      await ctx.db.patch(featured._id, {
        active: true,
        mobileMoneyRef: mpesaReceipt,
      });

      await ctx.db.patch(featured.vehicleId, {
        isFeatured: true,
        featuredExpiresAt: featured.endDate,
        featuredCategory: featured.category,
      });

      if (existingTx) {
        await ctx.db.patch(existingTx._id, {
          status: "completed",
          metadata: { ...existingTx.metadata, mobileMoneyRef: mpesaReceipt },
        });
      }

      await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
        userId: featured.ownerId,
        title: "Featured Listing Activated",
        body: `Payment of KES ${amount} successful.`,
        url: "/dashboard/host/vehicles",
      });

      return { success: true };
    }

    return { success: false };
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