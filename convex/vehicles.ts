import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createVehicle = mutation({
  args: {
    ownerId: v.id("users"),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    type: v.union(
      v.literal("sedan"),
      v.literal("suv"),
      v.literal("luxury"),
      v.literal("wedding"),
      v.literal("truck")
    ),
    transmission: v.union(v.literal("automatic"), v.literal("manual")),
    fuelType: v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric")),
    seats: v.number(),
    pricePerDay: v.number(),
    address: v.string(),
    description: v.string(),
    features: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { ownerId, ...vehicleData } = args;
    return await ctx.db.insert("vehicles", {
      ...vehicleData,
      ownerId,
      currency: "KES",
      location: { lat: -1.2921, lng: 36.8219 },
      images: [],
      isVerified: false,
      isFeatured: false,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const listVehicles = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("sedan"),
        v.literal("suv"),
        v.literal("luxury"),
        v.literal("wedding"),
        v.literal("truck")
      )
    ),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let vehicles = await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.type) {
      vehicles = vehicles.filter((v) => v.type === args.type);
    }
    if (args.minPrice !== undefined) {
      vehicles = vehicles.filter((v) => v.pricePerDay >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      vehicles = vehicles.filter((v) => v.pricePerDay <= args.maxPrice!);
    }

    return vehicles.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  },
});

export const getVehicle = query({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.vehicleId);
  },
});

export const getOwnerVehicles = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vehicles")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const toggleFeatured = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    isFeatured: v.boolean(),
    featuredExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vehicleId, {
      isFeatured: args.isFeatured,
      featuredExpiresAt: args.featuredExpiresAt,
    });
  },
});
