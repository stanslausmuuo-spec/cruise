"use client";

import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface BookingConfirmationStepProps {
  bookingReference: string;
  vehicleName: string;
  totalAmount: number;
}

function BookingConfirmationStep({
  bookingReference,
  vehicleName,
  totalAmount,
}: BookingConfirmationStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>

      <div>
        <h3 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-2">
          Booking Confirmed!
        </h3>
        <p className="text-sm text-charcoal/60 dark:text-cream/60">
          Your booking for {vehicleName} has been confirmed.
        </p>
      </div>

      <div className="glass rounded-premium p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60 dark:text-cream/60">Reference</span>
          <span className="font-mono font-medium text-charcoal dark:text-cream">
            {bookingReference}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60 dark:text-cream/60">Amount Paid</span>
          <span className="font-heading font-bold text-brand-gold-400">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      <Link href="/dashboard/renter/trips">
        <Button variant="outline" className="w-full">
          <ArrowLeft className="h-4 w-4" />
          View My Trips
        </Button>
      </Link>
    </div>
  );
}

export { BookingConfirmationStep };
