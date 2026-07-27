"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import webPush from "web-push";

export const sendPushToUser = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("VAPID keys not configured, skipping push notification");
      return { sent: 0, failed: 0 };
    }

    webPush.setVapidDetails(
      "mailto:admin@cruise.app",
      vapidPublicKey,
      vapidPrivateKey
    );

    // Use dynamic import with any to avoid circular reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { api } = (await import("./_generated/api")) as any;

    const subscriptions = await ctx.runQuery(
      api.push.getSubscriptionsByUserId,
      { userId: args.userId }
    );

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url,
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub: { endpoint: string; keys: Record<string, string> }) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload
          );
          return { success: true };
        } catch (error: unknown) {
          if (error instanceof Error && "statusCode" in error && (error as { statusCode: number }).statusCode === 410) {
            await ctx.runMutation(api.push.removeSubscription, {
              endpoint: sub.endpoint,
            });
          }
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      })
    );

    return {
      sent: results.filter(
        (r): r is PromiseFulfilledResult<{ success: boolean }> =>
          r.status === "fulfilled" && r.value.success
      ).length,
      failed: results.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && !r.value.success)
      ).length,
    };
  },
});
