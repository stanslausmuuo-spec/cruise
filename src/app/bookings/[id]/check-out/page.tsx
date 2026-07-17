"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Camera, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Id } from "convex/_generated/dataModel";

export default function CheckOutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as Id<"bookings">;
  const checkOut = useMutation(api.bookings.checkOut);

  const [step, setStep] = useState(0);
  const [hasDamage, setHasDamage] = useState(false);
  const [damageDescription, setDamageDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const booking = useQuery(api.bookings.getBooking, { bookingId });
  const vehicle = useQuery(
    api.vehicles.getVehicle,
    booking ? { vehicleId: booking.vehicleId } : "skip"
  );

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await checkOut({ bookingId, photos, hasDamage });
      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      console.error("Check-out failed:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-2xl mx-auto">
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
      <div className="max-w-2xl mx-auto">
        <BackLink href={`/bookings/${bookingId}`} label="Back to booking" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-2">
            Check Out
          </h1>
          {vehicle && (
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-8">
              {vehicle.make} {vehicle.model}
            </p>
          )}

          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="font-heading font-bold text-charcoal dark:text-cream mb-3">
                  Capture Return Photos
                </h2>
                <div className="border-2 border-dashed border-charcoal/20 dark:border-white/20 rounded-2xl p-8 text-center hover:border-brand-gold-400/50 transition-colors cursor-pointer">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-charcoal/30 dark:text-cream/30" />
                  <p className="text-sm text-charcoal/60 dark:text-cream/60">
                    Tap to take return photos
                  </p>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => setStep(1)}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="font-heading font-bold text-charcoal dark:text-cream">
                Any Damage?
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setHasDamage(false);
                    handleCheckOut();
                  }}
                  className="glass rounded-premium p-6 text-center hover:border-green-500/50 border-2 border-transparent transition-all"
                >
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="font-heading font-bold text-charcoal dark:text-cream">
                    No Damage
                  </p>
                  <p className="text-xs text-charcoal/60 dark:text-cream/60 mt-1">
                    Vehicle returned in good condition
                  </p>
                </button>

                <button
                  onClick={() => setHasDamage(true)}
                  className="glass rounded-premium p-6 text-center hover:border-red-500/50 border-2 border-transparent transition-all"
                >
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-500" />
                  <p className="font-heading font-bold text-charcoal dark:text-cream">
                    Report Damage
                  </p>
                  <p className="text-xs text-charcoal/60 dark:text-cream/60 mt-1">
                    Document any issues found
                  </p>
                </button>
              </div>

              {hasDamage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                      Describe the damage
                    </label>
                    <textarea
                      placeholder="Please describe the damage in detail..."
                      rows={4}
                      className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    loading={loading}
                    onClick={handleCheckOut}
                    disabled={!damageDescription}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Submit Damage Report
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
