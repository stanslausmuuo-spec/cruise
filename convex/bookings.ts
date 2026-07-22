import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { api, internal } from "./_generated/api";
import { validateFile } from "./lib/validateFile";

async function logAudit(ctx: any, action: string, metadata: any) {
  try {
    await ctx.scheduler.runAfter(0, internal.audit.logEvent, {
      action,
      metadata,
    });
  } catch {
    // Don't fail the main operation if audit logging fails
  }
}

export const createBooking = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    startDate: v.number(),
    endDate: v.number(),
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Validate date ordering
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (args.startDate < todayStart.getTime()) throw new Error("startDate must be today or later");
    if (args.endDate <= args.startDate) throw new Error("endDate must be after startDate");

    // Verify vehicle exists and is active
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    if (!vehicle.isActive) throw new Error("Vehicle is not available for booking");
    if (vehicle.ownerId === user._id) throw new Error("Cannot book your own vehicle");

    // Limit pending unpaid bookings to prevent availability abuse
    const pendingCount = await ctx.db
      .query("bookings")
      .withIndex("by_guest", (q) => q.eq("guestId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    if (pendingCount.length >= 10) throw new Error("Too many pending bookings. Complete or cancel existing ones.");

    // Calculate amounts server-side from trusted pricePerDay
    const msPerDay = 86400000;
    const numberOfDays = Math.ceil((args.endDate - args.startDate) / msPerDay);
    const totalAmount = vehicle.pricePerDay * numberOfDays;
    const platformFee = Math.ceil(totalAmount * 0.15);
    const depositAmount = Math.ceil(totalAmount * 0.10);

    // Check availability atomically
    const conflicting = await ctx.db
      .query("availability")
      .withIndex("by_vehicle_date", (q) => q.eq("vehicleId", args.vehicleId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate),
          q.eq(q.field("isAvailable"), false)
        )
      )
      .first();

    if (conflicting) throw new Error("Vehicle not available for selected dates");

    const bookingId = await ctx.db.insert("bookings", {
      vehicleId: args.vehicleId,
      guestId: user._id,
      hostId: vehicle.ownerId,
      startDate: args.startDate,
      endDate: args.endDate,
      totalAmount,
      platformFee,
      depositAmount,
      status: "pending",
      paymentStatus: "unpaid",
      checkoutRequestId: args.checkoutRequestId,
      checkInPhotos: [],
      checkOutPhotos: [],
      createdAt: Date.now(),
    });

    // Create availability records ATOMICALLY within this mutation
    // This prevents race conditions - if another booking tries these dates, it will see these records
    let currentDate = args.startDate;
    while (currentDate <= args.endDate) {
      await ctx.db.insert("availability", {
        vehicleId: args.vehicleId,
        date: currentDate,
        isAvailable: false,
        bookingId,
      });
      currentDate += 86400000;
    }

    // Create pending transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "booking_payment",
      amount: totalAmount,
      currency: "KES",
      reference: args.checkoutRequestId,
      status: "pending",
      metadata: { bookingId },
      createdAt: Date.now(),
    });

    await logAudit(ctx, "booking_created", {
      bookingId,
      vehicleId: args.vehicleId,
      guestId: user._id,
      hostId: vehicle.ownerId,
      totalAmount,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    return { bookingId, totalAmount, platformFee, depositAmount };
  },
});

export const confirmBookingPayment = mutation({
  args: {
    checkoutRequestId: v.string(),
    mobileMoneyRef: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Admin only");

    // Find booking by checkoutRequestId
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!booking) throw new Error("Booking not found");
    if (booking.paymentStatus === "paid") return { success: true, alreadyPaid: true };

    // Update booking status
    await ctx.db.patch(booking._id, {
      paymentStatus: "paid",
      mobileMoneyRef: args.mobileMoneyRef,
      status: "confirmed",
    });

    // Update transaction
    const transaction = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("reference"), args.checkoutRequestId))
      .first();
    if (transaction) {
      await ctx.db.patch(transaction._id, {
        status: "completed",
        mobileMoneyRef: args.mobileMoneyRef,
      });
    }

    await logAudit(ctx, "booking_payment_confirmed", {
      bookingId: booking._id,
      mobileMoneyRef: args.mobileMoneyRef,
      confirmedBy: user._id,
    });

    // Send push notification to guest
    await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
      userId: booking.guestId,
      title: "Booking Confirmed",
      body: "Your payment has been confirmed. The booking is now active.",
      url: `/dashboard/renter/trips`,
    });

    // Send push notification to host
    await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
      userId: booking.hostId,
      title: "New Booking",
      body: "A guest has booked your vehicle. Payment confirmed.",
      url: `/dashboard/host/vehicles`,
    });

    return { success: true };
  },
});

export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== user._id && booking.hostId !== user._id) throw new Error("Not authorized");

    if (booking.status === "cancelled") throw new Error("Booking already cancelled");
    if (booking.status === "completed") throw new Error("Cannot cancel completed booking");
    if (booking.status === "active") throw new Error("Cannot cancel active booking. Use check-out instead.");

    // Release availability
    const availabilityRecords = await ctx.db
      .query("availability")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    for (const record of availabilityRecords) {
      await ctx.db.delete(record._id);
    }

    // Update booking status
    await ctx.db.patch(args.bookingId, { status: "cancelled" });

    // Handle payment refund if paid
    if (booking.paymentStatus === "paid" || booking.paymentStatus === "partial_refund") {
      // Create refund transaction
      await ctx.db.insert("transactions", {
        userId: user._id,
        type: "refund",
        amount: booking.totalAmount,
        currency: "KES",
        reference: `refund_${booking._id}_${Date.now()}`,
        status: "pending",
        metadata: { bookingId: booking._id },
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.bookingId, { paymentStatus: "refunded" });
    }

    await logAudit(ctx, "booking_cancelled", {
      bookingId: booking._id,
      cancelledBy: user._id,
      reason: booking.guestId === user._id ? "guest_cancelled" : "host_cancelled",
    });

    // Notify other party
    const notifyId = booking.guestId === user._id ? booking.hostId : booking.guestId;
    await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
      userId: notifyId,
      title: "Booking Cancelled",
      body: "A booking has been cancelled.",
      url: booking.guestId === user._id ? `/dashboard/host/vehicles` : `/dashboard/renter/trips`,
    });

    return { success: true };
  },
});

export const checkIn = mutation({
  args: {
    bookingId: v.id("bookings"),
    photos: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== user._id) throw new Error("Not authorized");
    if (booking.status !== "confirmed") throw new Error("Only confirmed bookings can be checked in");

    for (const storageId of args.photos) {
      await validateFile(ctx, storageId);
    }

    await ctx.db.patch(args.bookingId, {
      status: "active",
      checkInTime: Date.now(),
      checkInPhotos: args.photos,
    });

    await logAudit(ctx, "booking_checkin", {
      bookingId: args.bookingId,
      guestId: user._id,
      photoCount: args.photos.length,
    });

    await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
      userId: booking.hostId,
      title: "Vehicle Checked In",
      body: "Your guest has checked in. The booking is now active.",
      url: `/dashboard/host/vehicles`,
    });
  },
});

export const checkOut = mutation({
  args: {
    bookingId: v.id("bookings"),
    photos: v.array(v.string()),
    hasDamage: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== user._id && booking.hostId !== user._id) throw new Error("Not authorized");
    if (booking.status !== "active") throw new Error("Only active bookings can be checked out");

    for (const storageId of args.photos) {
      await validateFile(ctx, storageId);
    }

    const updates: Record<string, unknown> = {
      checkOutTime: Date.now(),
      checkOutPhotos: args.photos,
    };

    if (args.hasDamage) {
      updates.status = "disputed";
    } else {
      updates.status = "completed";
    }

    await ctx.db.patch(args.bookingId, updates);

    await logAudit(ctx, "booking_checkout", {
      bookingId: args.bookingId,
      checkedOutBy: user._id,
      hasDamage: args.hasDamage,
      photoCount: args.photos.length,
    });

    const notifyUserId = args.hasDamage ? booking.hostId : booking.guestId;
    const notifyTitle = args.hasDamage ? "Dispute Opened" : "Booking Completed";
    const notifyBody = args.hasDamage
      ? "A check-out reported damage. A dispute has been opened."
      : "The booking has been completed successfully.";

    await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
      userId: notifyUserId,
      title: notifyTitle,
      body: notifyBody,
      url: `/dashboard/renter/trips`,
    });
  },
});

export const listBookings = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("disputed")
      )
    ),
    role: v.optional(v.union(v.literal("guest"), v.literal("host"))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = args.limit ?? 20;

    const isGuest = args.role === "guest" || (!args.role && true);
    const isHost = args.role === "host";

    let query;
    if (isGuest) {
      query = ctx.db.query("bookings").withIndex("by_guest", (q) => q.eq("guestId", user._id));
    } else {
      query = ctx.db.query("bookings").withIndex("by_host", (q) => q.eq("hostId", user._id));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const cursor = args.cursor ?? null;
    const page = await query.order("desc").paginate({ cursor, numItems: limit + 1 });

    return {
      bookings: page.page,
      nextCursor: page.continueCursor,
      hasMore: page.page.length > limit,
    };
  },
});

export const getBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) return null;
    if (booking.guestId !== user._id && booking.hostId !== user._id && !user.roles.includes("admin")) {
      return null;
    }

    return booking;
  },
});