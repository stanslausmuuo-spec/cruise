import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

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

export const sendMessage = mutation({
  args: {
    receiverId: v.id("users"),
    content: v.string(),
    bookingId: v.optional(v.id("bookings")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    const messageId = await ctx.db.insert("messages", {
      senderId: user._id,
      receiverId: args.receiverId,
      content: args.content,
      bookingId: args.bookingId,
      read: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "message",
      title: "New Message",
      body: args.content.slice(0, 100),
      data: { messageId, senderId: user._id },
      read: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getConversation = query({
  args: {
    otherUserId: v.id("users"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = args.limit ?? 50;

    // Use the by_participants index for proper bidirectional conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) => q.eq("senderId", user._id).eq("receiverId", args.otherUserId))
      .order("desc")
      .take(limit);

    const reverseMessages = await ctx.db
      .query("messages")
      .withIndex("by_participants_reverse", (q) => q.eq("receiverId", user._id).eq("senderId", args.otherUserId))
      .order("desc")
      .take(limit);

    // Merge and sort
    const allMessages = [...messages, ...reverseMessages].sort(
      (a, b) => a.createdAt - b.createdAt
    );

    return {
      messages: allMessages,
      nextCursor: undefined,
      hasMore: allMessages.length >= limit,
    };
  },
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.receiverId !== user._id) throw new Error("Not authorized");
    await ctx.db.patch(args.messageId, { read: true });
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_participants_reverse", (q) => q.eq("receiverId", user._id))
      .collect();

    return messages.filter((m) => !m.read && m.receiverId === user._id).length;
  },
});