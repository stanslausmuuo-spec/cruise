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

export const createBooking = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    startDate: v.number(),
    endDate: v.number(),
    totalAmount: v.number(),
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    const platformFee = Math.ceil(args.totalAmount * 0.15);
    const depositAmount = Math.ceil(args.totalAmount * 0.3);

    // Verify vehicle exists and is active
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    if (!vehicle.isActive) throw new Error("Vehicle is not available for booking");
    if (vehicle.ownerId === user._id) throw new Error("Cannot book your own vehicle");

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
      totalAmount: args.totalAmount,
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
      amount: args.totalAmount,
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
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending") throw new Error("Booking already processed");

    // Availability records already created in createBooking
    // Just confirm the booking
    await ctx.db.patch(booking._id, {
      status: "confirmed",
      paymentStatus: "paid",
      mobileMoneyRef: args.mobileMoneyRef,
    });

    // Update transaction to completed
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", booking.checkoutRequestId!))
      .first();

    if (transaction) {
      await ctx.db.patch(transaction._id, { status: "completed" });
    }

    return { success: true };
  },
});

export const cancelPendingBooking = mutation({
  args: {
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();

    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending") throw new Error("Booking already processed");

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
    return await ctx.db
      .query("bookings")
      .withIndex("by_checkout_request_id", (q) => q.eq("checkoutRequestId", args.checkoutRequestId))
      .first();
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
    
    await ctx.db.patch(args.bookingId, {
      status: "active",
      checkInTime: Date.now(),
      checkInPhotos: args.photos,
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
    if (booking.guestId !== user._id) throw new Error("Not authorized");

    const updates: Record<string, any> = {
      checkOutTime: Date.now(),
      checkOutPhotos: args.photos,
    };

    if (args.hasDamage) {
      updates.status = "disputed";
    } else {
      updates.status = "completed";
    }

    await ctx.db.patch(args.bookingId, updates);
  },
});