"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  Calendar,
  MessageSquare,
  Star,
  Plus,
  Search,
  Settings,
  Bell,
  BellOff,
} from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <SkeletonScreen type="dashboard" />
    </div>
  );
}

function PushNotificationToggle() {
  const { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe } =
    usePushNotifications();
  const [actionLoading, setActionLoading] = useState(false);

  if (!isSupported || loading) return null;

  const handleToggle = async () => {
    setActionLoading(true);
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setActionLoading(false);
  };

  return (
    <motion.div variants={fadeUp}>
      <div className="glass rounded-premium p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-brand-gold-400" />
          ) : (
            <BellOff className="h-5 w-5 text-charcoal/40 dark:text-cream/40" />
          )}
          <div>
            <p className="text-sm font-medium text-charcoal dark:text-cream">
              Push Notifications
            </p>
            <p className="text-xs text-charcoal/50 dark:text-cream/50">
              {permission === "granted"
                ? isSubscribed
                  ? "Enabled"
                  : "Paused"
                : permission === "denied"
                  ? "Blocked by browser"
                  : "Not enabled"}
            </p>
          </div>
        </div>
        {permission !== "denied" && (
          <button
            onClick={handleToggle}
            disabled={actionLoading}
            className="text-xs font-medium px-3 py-1.5 rounded-pill transition-colors duration-200 bg-gradient-to-r from-brand-gold-400 to-brand-gold-500 text-white hover:brightness-110 disabled:opacity-50"
          >
            {actionLoading
              ? "..."
              : isSubscribed
                ? "Disable"
                : "Enable"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function DashboardContent() {
  const currentUser = useQuery(api.auth.getMe);
  const bookings = useQuery(
    api.bookings.listBookings,
    currentUser ? { role: "guest" } : "skip"
  );
  const unreadMessages = useQuery(
    api.messages.getUnreadCount,
    currentUser ? {} : "skip"
  );

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="dashboard" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-4">
            Welcome to Cruise
          </h1>
          <p className="text-charcoal/60 dark:text-cream/60 mb-8">
            Sign in to access your dashboard
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-pill font-medium transition-colors duration-200 bg-gradient-to-r from-brand-gold-400 to-brand-gold-500 text-white hover:brightness-110 shadow-premium px-5 py-2.5 text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const activeBookings = bookings?.bookings?.filter((b) => b.status === "active" || b.status === "confirmed").length || 0;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">
            Welcome, <span className="text-gradient-gold">{(currentUser.name ?? "User").split(" ")[0]}</span>
          </h1>
          <p className="text-charcoal/60 dark:text-cream/60 mt-1">
            {(currentUser.roles ?? []).join(" . ")}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Calendar className="h-5 w-5 text-brand-gold-400" />}
                label="Active Bookings"
                value={activeBookings}
                href="/dashboard/renter/trips"
              />
              <StatCard
                icon={<MessageSquare className="h-5 w-5 text-brand-gold-400" />}
                label="Messages"
                value={unreadMessages ?? 0}
                href="/messages"
              />
              <StatCard
                icon={<Star className="h-5 w-5 text-brand-gold-400" />}
                label="Rating"
                value={(currentUser.rating ?? 0).toFixed(1)}
                href="/profile"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/vehicles/new">
                <div className="glass rounded-premium p-4 text-center hover:shadow-premium-hover transition-shadow cursor-pointer">
                  <Plus className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
                  <p className="text-sm font-medium text-charcoal dark:text-cream">List a Car</p>
                </div>
              </Link>
              <Link href="/vehicles">
                <div className="glass rounded-premium p-4 text-center hover:shadow-premium-hover transition-shadow cursor-pointer">
                  <Search className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
                  <p className="text-sm font-medium text-charcoal dark:text-cream">Book a Car</p>
                </div>
              </Link>
              <Link href="/messages">
                <div className="glass rounded-premium p-4 text-center hover:shadow-premium-hover transition-shadow cursor-pointer">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
                  <p className="text-sm font-medium text-charcoal dark:text-cream">Messages</p>
                </div>
              </Link>
              <Link href="/profile">
                <div className="glass rounded-premium p-4 text-center hover:shadow-premium-hover transition-shadow cursor-pointer">
                  <Settings className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
                  <p className="text-sm font-medium text-charcoal dark:text-cream">Settings</p>
                </div>
              </Link>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <PushNotificationToggle />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
