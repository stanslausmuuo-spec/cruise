import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

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

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Get all messages sent or received by this user
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) => q.eq("senderId", user._id))
      .order("desc")
      .collect();

    const receivedMessages = await ctx.db
      .query("messages")
      .withIndex("by_participants_reverse", (q) => q.eq("receiverId", user._id))
      .order("desc")
      .collect();

    // Build a map of conversation partner -> latest message
    const conversationMap = new Map<string, { lastMessage: string; lastTimestamp: number; unreadCount: number }>();

    for (const msg of sentMessages) {
      const partnerId = msg.receiverId;
      const existing = conversationMap.get(partnerId);
      if (!existing || msg.createdAt > existing.lastTimestamp) {
        conversationMap.set(partnerId, {
          lastMessage: msg.content,
          lastTimestamp: msg.createdAt,
          unreadCount: 0,
        });
      }
    }

    for (const msg of receivedMessages) {
      const partnerId = msg.senderId;
      const existing = conversationMap.get(partnerId);
      if (!existing || msg.createdAt > existing.lastTimestamp) {
        conversationMap.set(partnerId, {
          lastMessage: msg.content,
          lastTimestamp: msg.createdAt,
          unreadCount: msg.read ? (existing?.unreadCount ?? 0) : ((existing?.unreadCount ?? 0) + 1),
        });
      } else if (!msg.read) {
        existing.unreadCount += 1;
      }
    }

    // Convert to array and sort by most recent
    const conversations = Array.from(conversationMap.entries())
      .map(([partnerId, data]) => ({ partnerId, ...data }))
      .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

    // Fetch partner names
    const conversationsWithNames = await Promise.all(
      conversations.map(async (conv) => {
        const partner = await ctx.db.get(conv.partnerId as any);
        const partnerName = partner && "name" in partner ? (partner as { name: string }).name : "Unknown";
        const partnerAvatar = partner && "avatarUrl" in partner ? (partner as { avatarUrl?: string }).avatarUrl : undefined;
        return {
          ...conv,
          partnerName,
          partnerAvatar,
        };
      })
    );

    return conversationsWithNames;
  },
});