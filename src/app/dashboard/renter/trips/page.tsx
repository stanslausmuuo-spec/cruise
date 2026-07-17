"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Calendar } from "lucide-react";

const statusVariant = (status: string) => {
  switch (status) {
    case "confirmed": return "status";
    case "active": return "verified";
    case "completed": return "verified";
    case "cancelled": return "status";
    case "disputed": return "premium";
    default: return "status";
  }
};

export default function RenterTripsPage() {
  const currentUser = useQuery(api.auth.getMe);
  const bookings = useQuery(
    api.bookings.getUserBookings,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="search" />
      </div>
    );
  }

  const trips = bookings?.asGuest || [];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink href="/dashboard" />
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-8">
          My Trips
        </h1>

        {trips.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="No trips yet"
            description="Browse vehicles and book your first trip."
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {trips.map((trip) => (
              <motion.div key={trip._id} variants={fadeUp}>
                <Link href={`/bookings/${trip._id}`}>
                  <div className="glass rounded-premium p-4 flex items-center gap-4 hover:shadow-premium-hover transition-shadow cursor-pointer">
                    <div className="h-20 w-24 rounded-lg overflow-hidden shrink-0 bg-charcoal/10 dark:bg-white/10">
                      <div className="h-full w-full flex items-center justify-center text-charcoal/30 dark:text-cream/30">
                        <Calendar className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-charcoal dark:text-cream truncate">
                          Booking #{trip._id.slice(-6)}
                        </h3>
                        <Badge variant={statusVariant(trip.status) as "status" | "verified" | "premium"}>
                          {trip.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-charcoal/60 dark:text-cream/60">
                        {formatDate(trip.startDate, "short")} - {formatDate(trip.endDate, "short")}
                      </p>
                      <p className="text-sm font-heading font-bold text-brand-gold-400 mt-1">
                        {formatCurrency(trip.totalAmount)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
