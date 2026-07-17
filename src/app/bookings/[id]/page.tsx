"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  CreditCard,
  User,
  MessageSquare,
  Camera,
} from "lucide-react";
import type { Id } from "convex/_generated/dataModel";

const statusVariant = (status: string) => {
  switch (status) {
    case "confirmed":
      return "status";
    case "active":
      return "verified";
    case "completed":
      return "verified";
    case "cancelled":
      return "status";
    case "disputed":
      return "premium";
    default:
      return "status";
  }
};

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as Id<"bookings">;

  const booking = useQuery(api.bookings.getBooking, { bookingId });
  const vehicle = useQuery(
    api.vehicles.getVehicle,
    booking ? { vehicleId: booking.vehicleId } : "skip"
  );
  const host = useQuery(
    api.auth.getUser,
    booking ? { userId: booking.hostId } : "skip"
  );

  if (booking === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="detail" />
      </div>
    );
  }

  if (booking === null) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <BackLink href="/dashboard/renter/trips" />
          <EmptyState
            title="Booking not found"
            description="This booking may have been removed or doesn't exist."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink href="/dashboard/renter/trips" label="Back to trips" />

        {vehicle && (
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8">
            <img
              src={vehicle.images[0] || "/placeholder-car.jpg"}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="font-heading text-2xl font-bold">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-sm text-white/80">{vehicle.address}</p>
            </div>
            <div className="absolute top-4 right-4">
              <Badge variant={statusVariant(booking.status) as any}>
                {booking.status}
              </Badge>
            </div>
          </div>
        )}

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} className="glass rounded-premium p-6">
            <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">
              Booking Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                <div>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Pickup</p>
                  <p className="text-sm font-medium text-charcoal dark:text-cream">
                    {formatDate(booking.startDate, "long")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                <div>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Return</p>
                  <p className="text-sm font-medium text-charcoal dark:text-cream">
                    {formatDate(booking.endDate, "long")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                <div>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Total Paid</p>
                  <p className="text-sm font-heading font-bold text-brand-gold-400">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </div>
              {booking.mobileMoneyRef && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                  <div>
                    <p className="text-xs text-charcoal/50 dark:text-cream/50">Reference</p>
                    <p className="text-sm font-mono text-charcoal dark:text-cream">
                      {booking.mobileMoneyRef}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass rounded-premium p-6">
            <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">
              Host
            </h2>
            {host && (
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-gold-400 to-brand-gold-600 flex items-center justify-center text-white font-bold">
                  {host.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-charcoal dark:text-cream">{host.name}</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">
                    {host.rating} ({host.reviewCount} reviews)
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Link href="/messages">
                <Button variant="outline" className="w-full" size="sm">
                  <MessageSquare className="h-4 w-4" />
                  Contact Host
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} initial="initial" animate="animate" className="mt-6 flex gap-4">
          {booking.status === "confirmed" && (
            <Link href={`/bookings/${booking._id}/check-in`} className="flex-1">
              <Button className="w-full" size="lg">
                <Camera className="h-4 w-4" />
                Check In
              </Button>
            </Link>
          )}
          {booking.status === "active" && (
            <Link href={`/bookings/${booking._id}/check-out`} className="flex-1">
              <Button variant="secondary" className="w-full" size="lg">
                <Camera className="h-4 w-4" />
                Check Out
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
