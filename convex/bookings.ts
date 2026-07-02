import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBooking = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    guestId: v.id("users"),
    hostId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
    totalAmount: v.number(),
    mobileMoneyRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const platformFee = Math.ceil(args.totalAmount * 0.15);
    const depositAmount = Math.ceil(args.totalAmount * 0.3);

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
      guestId: args.guestId,
      hostId: args.hostId,
      startDate: args.startDate,
      endDate: args.endDate,
      totalAmount: args.totalAmount,
      platformFee,
      depositAmount,
      status: "confirmed",
      paymentStatus: "paid",
      mobileMoneyRef: args.mobileMoneyRef,
      checkInPhotos: [],
      checkOutPhotos: [],
      createdAt: Date.now(),
    });

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

    await ctx.db.insert("transactions", {
      userId: args.guestId,
      type: "booking_payment",
      amount: args.totalAmount,
      currency: "KES",
      reference: `CRU-${Date.now()}`,
      status: "completed",
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

export const getUserBookings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const asGuest = await ctx.db
      .query("bookings")
      .withIndex("by_guest", (q) => q.eq("guestId", args.userId))
      .collect();

    const asHost = await ctx.db
      .query("bookings")
      .withIndex("by_host", (q) => q.eq("hostId", args.userId))
      .collect();

    return { asGuest, asHost };
  },
});

export const getBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
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
    await ctx.db.patch(args.bookingId, { status: args.status });
  },
});

export const checkIn = mutation({
  args: {
    bookingId: v.id("bookings"),
    photos: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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
