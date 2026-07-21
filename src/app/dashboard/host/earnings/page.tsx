"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { StatCard } from "@/components/ui/stat-card";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, TrendingUp, Clock, CreditCard } from "lucide-react";

function EarningsSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <SkeletonScreen type="dashboard" />
    </div>
  );
}

function EarningsContent() {
  const currentUser = useQuery(api.auth.getMe);
  const hostEarnings = useQuery(
    api.payments.getHostEarnings,
    currentUser ? {} : "skip"
  );

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="dashboard" />
      </div>
    );
  }

  const totalEarnings = hostEarnings?.totalEarnings ?? 0;
  const thisMonthEarnings = hostEarnings?.thisMonthEarnings ?? 0;
  const pendingPayouts = hostEarnings?.pendingPayouts ?? 0;
  const recentBookings = hostEarnings?.recentBookings ?? [];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink href="/dashboard" />
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-8">
          Earnings
        </h1>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Wallet className="h-5 w-5 text-brand-gold-400" />}
                label="Total Earnings"
                value={formatCurrency(totalEarnings)}
              />
              <StatCard
                icon={<TrendingUp className="h-5 w-5 text-brand-gold-400" />}
                label="This Month"
                value={formatCurrency(thisMonthEarnings)}
              />
              <StatCard
                icon={<Clock className="h-5 w-5 text-brand-gold-400" />}
                label="Pending Payouts"
                value={formatCurrency(pendingPayouts)}
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">
              Recent Transactions
            </h2>
            {recentBookings.length === 0 ? (
              <EmptyState
                icon={<CreditCard className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
                title="No transactions yet"
                description="Your earnings will appear here once you receive bookings."
              />
            ) : (
              <div className="glass rounded-premium overflow-hidden">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-4 border-b border-charcoal/5 dark:border-white/5 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-charcoal dark:text-cream">
                          Booking {booking._id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60">
                          {formatDate(booking.createdAt, "short")}
                        </p>
                      </div>
                      <p className="font-heading font-bold text-brand-gold-400">
                        {formatCurrency(booking.totalAmount - booking.platformFee)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function HostEarningsPage() {
  return (
    <Suspense fallback={<EarningsSkeleton />}>
      <EarningsContent />
    </Suspense>
  );
}
