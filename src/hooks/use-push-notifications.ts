"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const subscribeMutation = useMutation(api.push.subscribe);
  const unsubscribeMutation = useMutation(api.push.unsubscribe);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result !== "granted") return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const { endpoint, keys } = subscription.toJSON();
      await subscribeMutation({
        endpoint: endpoint!,
        keys: keys as { p256dh: string; auth: string },
      });

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      return false;
    }
  }, [isSupported, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribeMutation({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }

      return true;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  }, [isSupported, unsubscribeMutation]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  };
}
