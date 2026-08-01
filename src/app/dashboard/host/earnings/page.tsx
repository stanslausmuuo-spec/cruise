"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { StatCard } from "@/components/ui/stat-card";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, TrendingUp, Inbox, AlertTriangle, ChevronRight } from "lucide-react";

function StatsSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <SkeletonScreen type="dashboard" />
    </div>
  );
}

function StatsContent() {
  const currentUser = useQuery(api.auth.getMe);
  const stats = useQuery(
    api.payments.getHostBookingStats,
    currentUser ? {} : "skip"
  );

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="dashboard" />
      </div>
    );
  }

  const totalBookings = stats?.totalBookings ?? 0;
  const totalBookedValue = stats?.totalBookedValue ?? 0;
  const thisMonthValue = stats?.thisMonthValue ?? 0;
  const pendingRequests = stats?.pendingRequests ?? 0;
  const disputedBookings = stats?.disputedBookings ?? 0;
  const recentBookings = stats?.recentBookings ?? [];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink href="/dashboard" />
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-8">
          Bookings
        </h1>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Calendar className="h-5 w-5 text-brand-gold-400" />}
                label="Total Bookings"
                value={totalBookings}
                href="/dashboard/host/bookings"
              />
              <StatCard
                icon={<TrendingUp className="h-5 w-5 text-brand-gold-400" />}
                label="Booked Value (This Month)"
                value={formatCurrency(thisMonthValue)}
                href="/dashboard/host/bookings"
              />
              <StatCard
                icon={<Inbox className="h-5 w-5 text-brand-gold-400" />}
                label="Pending Requests"
                value={pendingRequests}
                href="/dashboard/host/bookings"
              />
            </div>
            <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-3">
              Booked value is settled directly with renters — CruiseLinx never holds
              or pays out rental money. Total booked value: {formatCurrency(totalBookedValue)}.
              {disputedBookings > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {" "}You have {disputedBookings} disputed booking{disputedBookings !== 1 ? "s" : ""}.
                </span>
              )}
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                Recent Bookings
              </h2>
              <Link
                href="/dashboard/host/bookings"
                className="text-sm text-brand-gold-400 font-medium inline-flex items-center gap-1"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
                title="No bookings yet"
                description="Your confirmed bookings will appear here."
              />
            ) : (
              <div className="glass rounded-premium overflow-hidden">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking._id}
                    href={`/bookings/${booking._id}`}
                    className="block p-4 border-b border-charcoal/5 dark:border-white/5 last:border-0 hover:bg-charcoal/[0.02] dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-charcoal dark:text-cream capitalize">
                          {booking.status}
                        </p>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60">
                          {formatDate(booking.startDate, "short")} &middot; {formatDate(booking.endDate, "short")}
                        </p>
                      </div>
                      <p className="font-heading font-bold text-brand-gold-400">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function HostStatsPage() {
  return (
    <Suspense fallback={<StatsSkeleton />}>
      <StatsContent />
    </Suspense>
  );
}
