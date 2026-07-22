import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { api } from "./_generated/api";

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

    return { bookingId, checkoutRequestId: args.checkoutRequestId };
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

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending") return { success: true };

    await ctx.db.patch(booking._id, {
      status: "confirmed",
      paymentStatus: "paid",
      mobileMoneyRef: args.mobileMoneyRef,
    });

    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", booking.checkoutRequestId!))
      .first();

    if (transaction) {
      await ctx.db.patch(transaction._id, { status: "completed" });
    }

    const vehicle = await ctx.db.get(booking.vehicleId);
    if (vehicle) {
      await ctx.scheduler.runAfter(0, api.pushActions.sendPushToUser, {
        userId: vehicle.ownerId,
        title: "New Booking!",
        body: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} has been booked.`,
        url: "/dashboard/host/vehicles",
      });
    }

    return { success: true };
  },
});

export const cancelPendingBooking = mutation({
  args: {
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending") throw new Error("Booking already processed");

    // Only the guest or an admin can cancel a pending booking
    if (booking.guestId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }

    // Delete availability records created for this booking
    const availabilityRecords = await ctx.db
      .query("availability")
      .withIndex("by_vehicle_date", (q) => q.eq("vehicleId", booking.vehicleId))
      .filter((q) => q.eq(q.field("bookingId"), booking._id))
      .collect();

    for (const record of availabilityRecords) {
      await ctx.db.delete(record._id);
    }

    // Update booking status to cancelled
    await ctx.db.patch(booking._id, {
      status: "cancelled",
      paymentStatus: "unpaid",
    });

    // Update transaction to failed
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", booking.checkoutRequestId!))
      .first();

    if (transaction) {
      await ctx.db.patch(transaction._id, { status: "failed" });
    }

    await ctx.scheduler.runAfter(0, api.pushActions.sendPushToUser, {
      userId: booking.hostId,
      title: "Booking Cancelled",
      body: "A pending booking for your vehicle has been cancelled.",
      url: "/dashboard/host/vehicles",
    });

    return { success: true };
  },
});

export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    const asGuest = await ctx.db
      .query("bookings")
      .withIndex("by_guest", (q) => q.eq("guestId", user._id))
      .collect();

    const asHost = await ctx.db
      .query("bookings")
      .withIndex("by_host", (q) => q.eq("hostId", user._id))
      .collect();

    return { asGuest, asHost };
  },
});

export const getBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) return null;
    if (booking.guestId !== user._id && booking.hostId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }
    
    return booking;
  },
});

export const getBookingByCheckoutRequestId = query({
  args: { checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!booking) return null;
    if (booking.guestId !== user._id && booking.hostId !== user._id && !user.roles.includes("admin")) return null;

    return booking;
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) throw new Error("Booking not found");
    if (booking.hostId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }

    const allowedTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["active", "cancelled"],
      active: ["completed", "disputed"],
      completed: [],
      cancelled: [],
      disputed: [],
    };

    if (!allowedTransitions[booking.status]?.includes(args.status)) {
      throw new Error(`Cannot transition from "${booking.status}" to "${args.status}"`);
    }

    if (args.status === "cancelled" && booking.paymentStatus === "paid") {
      await ctx.db.insert("transactions", {
        userId: booking.guestId,
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
    
    await ctx.db.patch(args.bookingId, { status: args.status });
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
    
    await ctx.db.patch(args.bookingId, {
      status: "active",
      checkInTime: Date.now(),
      checkInPhotos: args.photos,
    });

    await ctx.scheduler.runAfter(0, api.pushActions.sendPushToUser, {
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

    const notifyUserId = args.hasDamage ? booking.hostId : booking.guestId;
    const notifyTitle = args.hasDamage
      ? "Dispute Opened"
      : "Booking Completed";
    const notifyBody = args.hasDamage
      ? "A check-out reported damage. A dispute has been opened."
      : "The booking has been completed successfully.";

    await ctx.scheduler.runAfter(0, api.pushActions.sendPushToUser, {
      userId: notifyUserId,
      title: notifyTitle,
      body: notifyBody,
      url: `/dashboard/renter/trips`,
    });
  },
});