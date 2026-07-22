import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sha256 } from "./lib/crypto";

function hashOTP(otp: string): string {
  return sha256(otp);
}

export const createOTP = mutation({
  args: {
    userId: v.optional(v.id("users")),
    email: v.string(),
    otp: v.string(),
    type: v.union(v.literal("email_verification"), v.literal("password_reset")),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await ctx.db.insert("otp_verifications", {
      userId: args.userId,
      email: args.email,
      otp: hashOTP(args.otp),
      type: args.type,
      expiresAt,
      verified: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const verifyOTP = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
    type: v.union(v.literal("email_verification"), v.literal("password_reset")),
  },
  handler: async (ctx, args) => {
    const hashedInput = hashOTP(args.otp);
    const records = await ctx.db
      .query("otp_verifications")
      .withIndex("by_email_type", (q) => q.eq("email", args.email).eq("type", args.type))
      .filter((q) => q.eq(q.field("verified"), false))
      .order("desc")
      .collect();

    const record = records.find((r) => r.otp === hashedInput);

    if (!record) {
      // Use constant-time comparison to prevent timing attacks
      const dummy = hashOTP("000000");
      const equal = dummy.length === hashedInput.length;
      if (equal) {
        const a = new TextEncoder().encode(dummy);
        const b = new TextEncoder().encode(hashedInput);
        for (let i = 0; i < a.length; i++) {
          a[i] = b[i];
        }
      }
      throw new Error("Invalid OTP");
    }

    if (record.expiresAt < Date.now()) {
      throw new Error("OTP expired");
    }

    await ctx.db.patch(record._id, { verified: true });

    return { success: true, userId: record.userId };
  },
});

export const getPendingOTP = query({
  args: {
    email: v.string(),
    type: v.union(v.literal("email_verification"), v.literal("password_reset")),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("otp_verifications")
      .withIndex("by_email_type", (q) => q.eq("email", args.email).eq("type", args.type))
      .filter((q) => q.eq(q.field("verified"), false))
      .order("desc")
      .first();
    if (!record) return null;
    const { otp: _, ...safe } = record;
    return safe;
  },
});