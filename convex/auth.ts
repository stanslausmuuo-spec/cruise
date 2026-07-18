import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
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

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    return user?.roles.includes("admin") ?? false;
  },
});

export const getPublicUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      rating: user.rating,
      reviewCount: user.reviewCount,
      verified: user.verified,
      createdAt: user.createdAt,
    };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser) return null;

    const isOwnProfile = currentUser._id === args.userId;
    const isAdmin = currentUser.roles.includes("admin");

    if (!isOwnProfile && !isAdmin) {
      return null;
    }

    return await ctx.db.get(args.userId);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});