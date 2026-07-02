import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    bookingId: v.optional(v.id("bookings")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
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
      data: { messageId, senderId: args.senderId },
      read: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getConversation = query({
  args: {
    userId: v.id("users"),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) =>
        q.eq("senderId", args.userId).eq("receiverId", args.otherUserId)
      )
      .collect();

    const reverseMessages = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) =>
        q.eq("senderId", args.otherUserId).eq("receiverId", args.userId)
      )
      .collect();

    return [...messages, ...reverseMessages].sort(
      (a, b) => a.createdAt - b.createdAt
    );
  },
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { read: true });
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) =>
        q.eq("senderId", args.userId)
      )
      .collect();

    return messages.filter((m) => !m.read && m.receiverId === args.userId).length;
  },
});
