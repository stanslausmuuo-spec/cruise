"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Camera, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";
import type { Id } from "convex/_generated/dataModel";

const steps = [
  { title: "Capture Odometer", description: "Take a photo of the current odometer reading" },
  { title: "Vehicle Exterior", description: "Take photos of the vehicle exterior" },
  { title: "Confirm Pickup", description: "Confirm you've received the vehicle" },
];

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as Id<"bookings">;
  const checkIn = useMutation(api.bookings.checkIn);

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const booking = useQuery(api.bookings.getBooking, { bookingId });
  const vehicle = useQuery(
    api.vehicles.getVehicle,
    booking ? { vehicleId: booking.vehicleId } : "skip"
  );

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await checkIn({ bookingId, photos });
      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      console.error("Check-in failed:", error);
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
            Check In
          </h1>
          {vehicle && (
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-8">
              {vehicle.make} {vehicle.model}
            </p>
          )}

          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                        ? "bg-brand-gold-400 text-white"
                        : "bg-charcoal/10 dark:bg-white/10 text-charcoal/50 dark:text-cream/50"
                    }`}
                  >
                    {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-12 ${i < step ? "bg-green-500" : "bg-charcoal/10 dark:bg-white/10"}`} />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-heading font-bold text-charcoal dark:text-cream">
                    {s.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 dark:text-cream/60">
                    {s.description}
                  </p>
                  {i === step && (
                    <div className="mt-4">
                      <FileUpload
                        label="Upload photos"
                        accept="image/png,image/jpeg,image/webp"
                        maxFiles={10}
                        maxSizeMB={10}
                        onFilesChange={(fileStates) => {
                          const validImages = fileStates
                            .filter((f) => f.storageId && !f.error)
                            .map((f) => f.storageId!);
                          setPhotos(validImages);
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < 2 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button
                size="sm"
                loading={loading}
                onClick={handleCheckIn}
              >
                <CheckCircle className="h-4 w-4" />
                Confirm Check-In
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
