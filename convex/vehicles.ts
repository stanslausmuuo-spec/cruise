import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Simple geocoding using Nominatim (OpenStreetMap) - free but rate limited
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "Cruise/1.0 (stanslaus.muuo@example.com)",
        },
      }
    );
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
  }
  return null;
}

// Auth helper: get current user identity
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

export const createVehicle = mutation({
  args: {
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
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Require host verification before listing
    if (!user.verified || user.kycStatus !== "approved") {
      throw new Error("Host must complete KYC verification before listing vehicles");
    }
    
    const location = await geocodeAddress(args.address) ?? { lat: -1.2921, lng: 36.8219 };
    return await ctx.db.insert("vehicles", {
      ...args,
      ownerId: user._id,
      currency: "KES",
      location,
      images: args.images ?? [],
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
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
handler: async (ctx: QueryCtx, args) => {
    const limit = args.limit ?? 20;
    
    // Build query using the most specific index available
    let queryBuilder: any = ctx.db.query("vehicles");
    
    if (args.type) {
      queryBuilder = queryBuilder.withIndex("by_active_type", (q: any) => q.eq("isActive", true).eq("type", args.type!));
    } else if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      queryBuilder = queryBuilder.withIndex("by_active_price", (q: any) => q.eq("isActive", true));
    } else {
      queryBuilder = queryBuilder.withIndex("by_active", (q: any) => q.eq("isActive", true));
    }
    
    // Order by createdAt desc (newest first)
    const orderedQuery = queryBuilder.order("desc");
    
    // Apply cursor for pagination
    const paginatedQuery = args.cursor
      ? orderedQuery.paginate({ cursor: args.cursor, numItems: limit + 1 })
      : orderedQuery.paginate({ numItems: limit + 1 });
    
    const page = await paginatedQuery;
    
    // Filter in-memory for price range (since we can't do range on secondary index)
    let vehicles = page.items;
    
    if (args.minPrice !== undefined) {
      vehicles = vehicles.filter((v: { pricePerDay: number }) => v.pricePerDay >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      vehicles = vehicles.filter((v: { pricePerDay: number }) => v.pricePerDay <= args.maxPrice!);
    }
    
    // Sort: featured first, then by createdAt desc
    vehicles.sort((a: { isFeatured: boolean; createdAt: number }, b: { isFeatured: boolean; createdAt: number }) => {
      if (b.isFeatured !== a.isFeatured) {
        return b.isFeatured ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    });
    
    const hasMore = vehicles.length > limit;
    if (hasMore) {
      vehicles = vehicles.slice(0, limit);
    }
    
    return {
      vehicles,
      nextCursor: hasMore ? page.continueCursor : undefined,
      hasMore,
    };
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
    const user = await getCurrentUser(ctx);
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.ownerId !== user._id) throw new Error("Not authorized");
    
    await ctx.db.patch(args.vehicleId, {
      isFeatured: args.isFeatured,
      featuredExpiresAt: args.featuredExpiresAt,
    });
  },
});

export const requireHostVerification = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user.verified || user.kycStatus !== "approved") {
      throw new Error("Host must complete KYC verification before listing vehicles");
    }
    
    return { verified: true };
  },
});

export const deleteVehicle = mutation({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const vehicle = await ctx.db.get(args.vehicleId);
    
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.ownerId !== user._id && !user.roles.includes("admin")) {
      throw new Error("Not authorized");
    }
    
    // Check if vehicle has active bookings
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "active"),
        q.eq(q.field("status"), "confirmed"),
        q.eq(q.field("status"), "pending")
      ))
      .first();
    
    if (activeBookings) {
      throw new Error("Cannot delete vehicle with active bookings");
    }
    
    // Delete availability records
    const availabilityRecords = await ctx.db
      .query("availability")
      .withIndex("by_vehicle_date", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();
    
    for (const record of availabilityRecords) {
      await ctx.db.delete(record._id);
    }
    
    // Delete the vehicle
    await ctx.db.delete(args.vehicleId);
    
    return { success: true };
  },
});