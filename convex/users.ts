import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const updates: Record<string, unknown> = {};

    if (args.name !== undefined) {
      if (args.name.length < 1 || args.name.length > 100) {
        throw new Error("name must be between 1 and 100 characters");
      }
      updates.name = args.name;
    }

    if (args.phone !== undefined) {
      // Kenyan phone number format: +254 followed by 9 digits, or 07XX/01XX local format
      const kenyanPhoneRegex = /^(\+254[17]\d{8}|0[17]\d{8})$/;
      if (!kenyanPhoneRegex.test(args.phone)) {
        throw new Error("phone must be a valid Kenyan phone number (e.g. +254712345678 or 0712345678)");
      }
      updates.phone = args.phone;
    }

    if (args.avatarUrl !== undefined) {
      try {
        new URL(args.avatarUrl);
      } catch {
        throw new Error("avatarUrl must be a valid URL");
      }
      updates.avatarUrl = args.avatarUrl;
    }

    if (args.bio !== undefined) {
      updates.bio = args.bio;
    }

    await ctx.db.patch(user._id, updates);
  },
});

export const updateTheme = mutation({
  args: {
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(user._id, { theme: args.theme });
  },
});

export const updateKYCStatus = mutation({
  args: {
    userId: v.id("users"),
    kycStatus: v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");
    
    // Enforce KYC integrity: only allow "approved" if all user's documents are approved
    if (args.kycStatus === "approved") {
      const userDocs = await ctx.db
        .query("kyc_documents")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      
      const allApproved = userDocs.length > 0 && userDocs.every((doc) => doc.status === "approved");
      if (!allApproved) {
        throw new Error("Cannot approve KYC: not all documents are approved");
      }
    }

    const updates: { kycStatus: "none" | "pending" | "approved" | "rejected"; verified?: boolean } = { kycStatus: args.kycStatus };
    if (args.verified !== undefined) updates.verified = args.verified;
    if (args.kycStatus === "approved") updates.verified = true;
    if (args.kycStatus === "rejected") updates.verified = false;
    
    await ctx.db.patch(args.userId, updates);
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");
    return await ctx.db.query("users").collect();
  },
});

export const getHosts = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter((u) => u.roles.includes("host"));
  },
});