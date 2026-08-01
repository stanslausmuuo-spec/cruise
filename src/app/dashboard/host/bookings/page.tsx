"use client";

import { Suspense, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Inbox, Check, X, CalendarDays } from "lucide-react";
import type { Doc } from "convex/_generated/dataModel";

function BookingsSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <SkeletonScreen type="dashboard" />
    </div>
  );
}

function VehicleLabel({ booking }: { booking: Doc<"bookings"> }) {
  const vehicle = useQuery(api.vehicles.getVehicle, { vehicleId: booking.vehicleId });
  if (!vehicle) return <span>{booking.vehicleId.slice(0, 8)}</span>;
  return (
    <span>
      {vehicle.make} {vehicle.model} ({vehicle.year})
    </span>
  );
}

function GuestName({ booking }: { booking: Doc<"bookings"> }) {
  const guest = useQuery(api.auth.getUser, { userId: booking.guestId });
  return <span>{guest?.name ?? "Guest"}</span>;
}

function PendingRequestCard({
  booking,
  guestName,
  vehicleLabel,
  onRespond,
  loading,
}: {
  booking: Doc<"bookings">;
  guestName: ReactNode;
  vehicleLabel: ReactNode;
  onRespond: (approve: boolean) => void;
  loading: boolean;
}) {
  return (
    <div className="glass rounded-premium p-4 border border-brand-gold-400/30">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="font-heading font-bold text-charcoal dark:text-cream">
            {vehicleLabel}
          </p>
          <p className="text-sm text-charcoal/60 dark:text-cream/60">
            {guestName} &middot; {formatDate(booking.startDate, "short")} &rarr;{" "}
            {formatDate(booking.endDate, "short")}
          </p>
        </div>
        <p className="font-heading font-bold text-brand-gold-400">
          {formatCurrency(booking.totalAmount)}
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => onRespond(true)}
          disabled={loading}
          className="flex-1"
          size="sm"
        >
          <Check className="h-4 w-4" /> Approve
        </Button>
        <Button
          onClick={() => onRespond(false)}
          disabled={loading}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          <X className="h-4 w-4" /> Decline
        </Button>
      </div>
    </div>
  );
}

function BookingsContent() {
  const currentUser = useQuery(api.auth.getMe);
  const result = useQuery(
    api.bookings.listBookings,
    currentUser ? { role: "host", limit: 50 } : "skip"
  );
  const respondToBooking = useMutation(api.bookings.respondToBooking);

  const [respondingId, setRespondingId] = useState<string | null>(null);

  const bookings = result?.bookings ?? [];
  const pendingRequests = bookings.filter((b) => b.status === "pending");

  const handleRespond = async (bookingId: string, approve: boolean) => {
    setRespondingId(bookingId);
    try {
      await respondToBooking({ bookingId: bookingId as never, approve });
    } catch (error) {
      console.error("Failed to respond to booking:", error);
      alert(error instanceof Error ? error.message : "Failed to respond");
    } finally {
      setRespondingId(null);
    }
  };

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink href="/dashboard" />
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-8">
          Booking Requests
        </h1>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <Inbox className="h-5 w-5 text-brand-gold-400" />
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                Pending Requests
              </h2>
              <Badge variant="premium">{pendingRequests.length}</Badge>
            </div>
            {pendingRequests.length === 0 ? (
              <div className="glass rounded-premium p-6">
                <p className="text-sm text-charcoal/60 dark:text-cream/60">
                  No pending requests. New booking requests will appear here for your approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((booking) => (
                  <PendingRequestCard
                    key={booking._id}
                    booking={booking}
                    guestName={<GuestName booking={booking} />}
                    vehicleLabel={<VehicleLabel booking={booking} />}
                    onRespond={(approve) => handleRespond(booking._id, approve)}
                    loading={respondingId === booking._id}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-brand-gold-400" />
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                All Bookings
              </h2>
            </div>
            {bookings.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
                title="No bookings yet"
                description="Bookings for your vehicles will appear here."
              />
            ) : (
              <div className="glass rounded-premium overflow-hidden">
                {bookings.map((booking) => (
                  <Link
                    key={booking._id}
                    href={`/bookings/${booking._id}`}
                    className="block p-4 border-b border-charcoal/5 dark:border-white/5 last:border-0 hover:bg-charcoal/[0.02] dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm text-charcoal dark:text-cream">
                          <VehicleLabel booking={booking} />
                        </p>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60">
                          <GuestName booking={booking} /> &middot;{" "}
                          {formatDate(booking.startDate, "short")} &rarr;{" "}
                          {formatDate(booking.endDate, "short")}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === "disputed" ? "premium" : "status"}>
                          {booking.status}
                        </Badge>
                        <p className="font-heading font-bold text-brand-gold-400 mt-1">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>
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

export default function HostBookingsPage() {
  return (
    <Suspense fallback={<BookingsSkeleton />}>
      <BookingsContent />
    </Suspense>
  );
}
