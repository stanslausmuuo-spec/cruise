"use client";

import { formatCurrency } from "@/lib/utils";

interface PriceSummaryProps {
  pricePerDay: number;
  numberOfDays: number;
}

function PriceSummary({ pricePerDay, numberOfDays }: PriceSummaryProps) {
  const subtotal = pricePerDay * numberOfDays;

  return (
    <div className="glass rounded-premium p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-charcoal/60 dark:text-cream/60">
          {formatCurrency(pricePerDay)} x {numberOfDays} day{numberOfDays !== 1 ? "s" : ""}
        </span>
        <span className="font-medium text-charcoal dark:text-cream">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <div className="border-t border-charcoal/5 dark:border-white/5 pt-3 flex justify-between">
        <span className="font-heading font-bold text-charcoal dark:text-cream">Total</span>
        <span className="font-heading text-xl font-bold text-brand-gold-400">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <p className="text-xs text-charcoal/50 dark:text-cream/50">
        Paid directly to the host — CruiseLinx does not collect rental payments.
      </p>
    </div>
  );
}

export { PriceSummary };
