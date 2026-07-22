import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";

type Vehicle = Doc<"vehicles">;

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
    blurDataUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Require host verification before listing
    if (!user.verified || user.kycStatus !== "approved") {
      throw new Error("Host must complete KYC verification before listing vehicles");
    }

    // Input validation
    if (!args.make.trim()) throw new Error("make must be a non-empty string");
    if (!args.model.trim()) throw new Error("model must be a non-empty string");
    if (!args.description.trim()) throw new Error("description must be a non-empty string");
    
    const currentYear = new Date().getFullYear();
    if (args.year < 1990 || args.year > currentYear + 1) {
      throw new Error(`year must be between 1990 and ${currentYear + 1}`);
    }
    if (args.seats < 1 || args.seats > 15) throw new Error("seats must be between 1 and 15");
    if (args.pricePerDay < 100) throw new Error("pricePerDay must be at least 100 KES");
    
    const images = args.images ?? [];
    if (images.length < 1) throw new Error("At least 1 image is required");
    if (images.length > 20) throw new Error("Maximum 20 images allowed");
    
    const location = await geocodeAddress(args.address) ?? { lat: -1.2921, lng: 36.8219 };
    return await ctx.db.insert("vehicles", {
      ...args,
      ownerId: user._id,
      currency: "KES",
      location,
      images: args.images ?? [],
      blurDataUrls: args.blurDataUrls,
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
    transmission: v.optional(v.union(v.literal("automatic"), v.literal("manual"))),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
handler: async (ctx: QueryCtx, args) => {
    const limit = args.limit ?? 20;
    
    // Build query using the most specific index available
    const isActive = true as const;
    const cursor = args.cursor ?? null;
    
    if (args.type) {
      const page = await ctx.db
        .query("vehicles")
        .withIndex("by_active_type", (q) => q.eq("isActive", isActive).eq("type", args.type!))
        .order("desc")
        .paginate({ cursor, numItems: limit + 1 });
      
      return processPage(page, limit, args);
    } else if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      const page = await ctx.db
        .query("vehicles")
        .withIndex("by_active_price", (q) => q.eq("isActive", isActive))
        .order("desc")
        .paginate({ cursor, numItems: limit + 1 });
      
      return processPage(page, limit, args);
    } else {
      const page = await ctx.db
        .query("vehicles")
        .withIndex("by_active", (q) => q.eq("isActive", isActive))
        .order("desc")
        .paginate({ cursor, numItems: limit + 1 });
      
      return processPage(page, limit, args);
    }
  },
});

function processPage(page: { page: Vehicle[]; continueCursor?: string }, limit: number, args: { transmission?: string; minPrice?: number; maxPrice?: number }) {
  // Filter in-memory for price range and transmission (since we can't do range on secondary index)
  let vehicles: Vehicle[] = page?.page ?? [];
  
  if (args.transmission) {
    vehicles = vehicles.filter((v: Vehicle) => v.transmission === args.transmission);
  }
  if (args.minPrice !== undefined) {
    vehicles = vehicles.filter((v: Vehicle) => v.pricePerDay >= args.minPrice!);
  }
  if (args.maxPrice !== undefined) {
    vehicles = vehicles.filter((v: Vehicle) => v.pricePerDay <= args.maxPrice!);
  }
  
  // Sort: featured first, then by createdAt desc
  vehicles.sort((a: Vehicle, b: Vehicle) => {
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
}

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
    if (!user.roles.includes("admin")) throw new Error("Admin only");

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    
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

export const updateVehicle = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("sedan"),
        v.literal("suv"),
        v.literal("luxury"),
        v.literal("wedding"),
        v.literal("truck")
      )
    ),
    transmission: v.optional(v.union(v.literal("automatic"), v.literal("manual"))),
    fuelType: v.optional(v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric"))),
    seats: v.optional(v.number()),
    pricePerDay: v.optional(v.number()),
    address: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    blurDataUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const vehicle = await ctx.db.get(args.vehicleId);

    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.ownerId !== user._id) throw new Error("Not authorized");

    // Block price changes when active bookings exist
    if (args.pricePerDay !== undefined && args.pricePerDay !== vehicle.pricePerDay) {
      const activeBooking = await ctx.db
        .query("bookings")
        .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
        .filter((q) => q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "confirmed"),
          q.eq(q.field("status"), "pending")
        ))
        .first();

      if (activeBooking) {
        throw new Error("Cannot change price while vehicle has active bookings");
      }
    }

    const updateData: Record<string, unknown> = {};
    if (args.make !== undefined) updateData.make = args.make;
    if (args.model !== undefined) updateData.model = args.model;
    if (args.year !== undefined) updateData.year = args.year;
    if (args.type !== undefined) updateData.type = args.type;
    if (args.transmission !== undefined) updateData.transmission = args.transmission;
    if (args.fuelType !== undefined) updateData.fuelType = args.fuelType;
    if (args.seats !== undefined) updateData.seats = args.seats;
    if (args.pricePerDay !== undefined) updateData.pricePerDay = args.pricePerDay;
    if (args.address !== undefined) {
      updateData.address = args.address;
      const location = await geocodeAddress(args.address);
      if (location) updateData.location = location;
    }
    if (args.description !== undefined) updateData.description = args.description;
    if (args.features !== undefined) updateData.features = args.features;
    if (args.images !== undefined) updateData.images = args.images;
    if (args.blurDataUrls !== undefined) updateData.blurDataUrls = args.blurDataUrls;

    await ctx.db.patch(args.vehicleId, updateData);
    return args.vehicleId;
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