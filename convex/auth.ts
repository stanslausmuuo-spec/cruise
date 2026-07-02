import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      name: identity.name ?? identity.email?.split("@")[0] ?? "User",
      email: identity.email!,
      phone: "",
      roles: ["renter"],
      verified: false,
      kycStatus: "none",
      rating: 0,
      reviewCount: 0,
      theme: "system",
      createdAt: Date.now(),
    });
  },
});

export const registerUser = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    roles: v.array(v.union(v.literal("renter"), v.literal("host"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        phone: args.phone,
        roles: args.roles as ("renter" | "host")[],
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: identity.email!,
      phone: args.phone,
      roles: args.roles as ("renter" | "host")[],
      verified: false,
      kycStatus: "none",
      rating: 0,
      reviewCount: 0,
      theme: "system",
      createdAt: Date.now(),
    });
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    return user;
  },
});
