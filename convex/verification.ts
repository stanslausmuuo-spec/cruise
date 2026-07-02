import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const uploadDocument = mutation({
  args: {
    userId: v.id("users"),
    documentType: v.union(
      v.literal("national_id"),
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("vehicle_logbook")
    ),
    fileStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("kyc_documents", {
      userId: args.userId,
      documentType: args.documentType,
      fileStorageId: args.fileStorageId,
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.userId, { kycStatus: "pending" });
  },
});

export const approveDocument = mutation({
  args: {
    documentId: v.id("kyc_documents"),
    reviewerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(args.documentId, {
      status: "approved",
      reviewedBy: args.reviewerId,
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
    reviewerId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: "rejected",
      reviewedBy: args.reviewerId,
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
    return await ctx.db
      .query("kyc_documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const getUserDocuments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kyc_documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
