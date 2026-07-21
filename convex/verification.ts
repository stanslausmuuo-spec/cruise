import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const uploadDocument = mutation({
  args: {
    documentType: v.union(
      v.literal("national_id"),
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("vehicle_logbook")
    ),
    fileStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    await ctx.db.insert("kyc_documents", {
      userId: user._id,
      documentType: args.documentType,
      fileStorageId: args.fileStorageId,
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.db.patch(user._id, { kycStatus: "pending" });
  },
});

export const approveDocument = mutation({
  args: {
    documentId: v.id("kyc_documents"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");
    
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(args.documentId, {
      status: "approved",
      reviewedBy: user._id,
      reviewedAt: Date.now(),
    });

    const allDocs = await ctx.db
      .query("kyc_documents")
      .withIndex("by_user", (q) => q.eq("userId", doc.userId))
      .collect();

    const allApproved = allDocs.every((d) => d.status === "approved");
    if (allApproved) {
      await ctx.db.patch(doc.userId, {
        kycStatus: "approved",
        verified: true,
      });
    }
  },
});

export const rejectDocument = mutation({
  args: {
    documentId: v.id("kyc_documents"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");
    
    await ctx.db.patch(args.documentId, {
      status: "rejected",
      reviewedBy: user._id,
      reviewedAt: Date.now(),
      rejectionReason: args.reason,
    });

    const doc = await ctx.db.get(args.documentId);
    if (doc) {
      await ctx.db.patch(doc.userId, { kycStatus: "rejected" });
    }
  },
});

export const getPendingVerifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Not authorized");
    
    return await ctx.db
      .query("kyc_documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const getUserDocuments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("kyc_documents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});