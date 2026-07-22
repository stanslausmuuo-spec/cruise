import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sha256 } from "./lib/crypto";

async function hashOTP(otp: string): Promise<string> {
  return await sha256(otp);
}

export const createOTP = mutation({
  args: {
    userId: v.optional(v.id("users")),
    email: v.string(),
    otp: v.string(),
    type: v.union(v.literal("email_verification"), v.literal("password_reset")),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await ctx.db.insert("otp_verifications", {
      userId: args.userId,
      email: args.email,
      otp: await hashOTP(args.otp),
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
    const hashedInput = await hashOTP(args.otp);
    const records = await ctx.db
      .query("otp_verifications")
      .withIndex("by_email_type", (q) => q.eq("email", args.email).eq("type", args.type))
      .filter((q) => q.eq(q.field("verified"), false))
      .order("desc")
      .collect();

    const record = records.find((r) => r.otp === hashedInput);

    if (!record) {
      throw new Error("Invalid OTP");
    }

    if (record.expiresAt < Date.now()) {
      throw new Error("OTP expired");
    }

    await ctx.db.patch(record._id, { verified: true });

    return { success: true, userId: record.userId };
  },
});
