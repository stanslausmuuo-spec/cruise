"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <WifiOff className="h-16 w-16 mx-auto mb-4 text-charcoal/30 dark:text-cream/30" />
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-2">You&apos;re Offline</h1>
        <p className="text-sm text-charcoal/60 dark:text-cream/60">
          Your booking data is still accessible. Changes will sync when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
