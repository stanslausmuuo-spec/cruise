"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import {
  Calendar,
  MessageSquare,
  Star,
  Plus,
  Search,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const currentUser = useQuery(api.auth.getMe);
  const bookings = useQuery(
    api.bookings.getUserBookings,
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

  const activeBookings = bookings?.asGuest?.filter((b) => b.status === "active" || b.status === "confirmed").length || 0;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">
            Welcome, <span className="text-gradient-gold">{currentUser.name.split(" ")[0]}</span>
          </h1>
          <p className="text-charcoal/60 dark:text-cream/60 mt-1">
            {currentUser.roles.join(" . ")}
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
                value={0}
                href="/messages"
              />
              <StatCard
                icon={<Star className="h-5 w-5 text-brand-gold-400" />}
                label="Rating"
                value={currentUser.rating.toFixed(1)}
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
        </motion.div>
      </div>
    </div>
  );
}
