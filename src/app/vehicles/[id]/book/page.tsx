"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { DateSelectionStep } from "@/components/booking/date-selection-step";
import { PriceSummary } from "@/components/booking/price-summary";
import { BookingNavigation } from "@/components/booking/booking-navigation";
import { formatCurrency } from "@/lib/utils";
import { Info, Loader2 } from "lucide-react";
import type { Id } from "convex/_generated/dataModel";

const steps = [
  { label: "Dates" },
  { label: "Review" },
];

export default function BookVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as Id<"vehicles">;
  const createBooking = useMutation(api.bookings.createBooking);

  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const vehicle = useQuery(api.vehicles.getVehicle, { vehicleId });

  const numberOfDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => {
    if (!vehicle || numberOfDays === 0) return 0;
    return vehicle.pricePerDay * numberOfDays;
  }, [vehicle, numberOfDays]);

  const handleRequest = async () => {
    if (!vehicle || numberOfDays === 0) return;
    setLoading(true);
    try {
      const { bookingId } = await createBooking({
        vehicleId: vehicle._id,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
      });
      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      console.error("Booking request failed:", error);
      alert(error instanceof Error ? error.message : "Booking request failed");
    } finally {
      setLoading(false);
    }
  };

  if (vehicle === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="detail" />
      </div>
    );
  }

  if (vehicle === null) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <BackLink href="/vehicles" />
          <EmptyState
            title="Vehicle not found"
            description="This vehicle may have been removed or doesn't exist."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <BackLink href={`/vehicles/${vehicle._id}`} label="Back to vehicle" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <div className="mb-6">
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-2">
              {vehicle.make} {vehicle.model} &middot; {vehicle.year}
            </p>
            <p className="font-heading text-xl font-bold text-charcoal dark:text-cream">
              {formatCurrency(vehicle.pricePerDay)} /day
            </p>
          </div>

          <BookingWizard steps={steps} currentStep={step} />

          <div className="space-y-5">
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <DateSelectionStep
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  numberOfDays={numberOfDays}
                />
                {numberOfDays > 0 && (
                  <div className="mt-6">
                    <PriceSummary
                      pricePerDay={vehicle.pricePerDay}
                      numberOfDays={numberOfDays}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="space-y-4">
                  <PriceSummary
                    pricePerDay={vehicle.pricePerDay}
                    numberOfDays={numberOfDays}
                  />

                  <div className="rounded-2xl border border-brand-gold-400/30 bg-brand-gold-400/5 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-brand-gold-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed">
                        <p className="font-medium text-charcoal dark:text-cream mb-1">
                          You pay the host directly
                        </p>
                        <p>
                          CruiseLinx never handles rental money. After the host approves
                          your request, you settle the total of{" "}
                          <span className="font-semibold">{formatCurrency(totalPrice)}</span>{" "}
                          with them directly — cash or M-Pesa person-to-person, at pickup.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleRequest}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Request Booking"
                    )}
                  </Button>
                  <p className="text-xs text-center text-charcoal/50 dark:text-cream/50">
                    No payment now. The host confirms your request first.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {step === 0 && (
            <BookingNavigation
              currentStep={step}
              totalSteps={steps.length}
              onBack={() => setStep((s) => Math.max(0, s - 1))}
              onNext={() => {
                if (step === 0 && numberOfDays > 0) setStep(1);
              }}
              loading={loading}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
