"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { DateSelectionStep } from "@/components/booking/date-selection-step";
import { PriceSummary } from "@/components/booking/price-summary";
import { MPesaPaymentForm } from "@/components/booking/mpesa-payment-form";
import { BookingConfirmationStep } from "@/components/booking/booking-confirmation-step";
import { BookingNavigation } from "@/components/booking/booking-navigation";
import { calculatePlatformFee, formatCurrency } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";

const steps = [
  { label: "Dates" },
  { label: "Payment" },
  { label: "Confirm" },
];

export default function BookVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as Id<"vehicles">;
  const createBooking = useMutation(api.bookings.createBooking);

  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

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
    const subtotal = vehicle.pricePerDay * numberOfDays;
    const platformFee = calculatePlatformFee(subtotal);
    return subtotal + platformFee;
  }, [vehicle, numberOfDays]);

  const handlePaymentInitiated = async (phone: string) => {
    setPhoneNumber(phone);
    setLoading(true);
    try {
      const ref = `CRU-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setBookingRef(ref);
      
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          amount: totalPrice,
          accountReference: ref,
          transactionDesc: "Cruise Booking",
          type: "booking",
          metadata: { vehicleId: vehicleId },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStep(2);
      } else {
        throw new Error(data.error || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      alert(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!vehicle || !bookingRef) return;
    setLoading(true);
    try {
      await createBooking({
        vehicleId: vehicle._id,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
        totalAmount: totalPrice,
        checkoutRequestId: bookingRef,
      });
      router.push("/dashboard/renter/trips");
    } catch (error) {
      console.error("Booking failed:", error);
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
                <MPesaPaymentForm
                  amount={totalPrice}
                  onPaymentInitiated={handlePaymentInitiated}
                  loading={loading}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <BookingConfirmationStep
                  bookingReference={bookingRef}
                  vehicleName={`${vehicle.make} ${vehicle.model}`}
                  totalAmount={totalPrice}
                />
              </motion.div>
            )}
          </div>

          {step < 2 && (
            <BookingNavigation
              currentStep={step}
              totalSteps={steps.length}
              onBack={() => setStep((s) => Math.max(0, s - 1))}
              onNext={() => {
                if (step === 0 && numberOfDays > 0) setStep(1);
                else if (step === 1) handleConfirm();
              }}
              loading={loading}
              nextLabel={step === 1 ? `Pay ${formatCurrency(totalPrice)}` : undefined}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
