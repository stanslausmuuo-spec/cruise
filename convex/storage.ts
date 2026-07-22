import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./lib/auth";

export const generateUploadUrl = mutation({
  args: {
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

export const deleteFile = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Admin only");
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});