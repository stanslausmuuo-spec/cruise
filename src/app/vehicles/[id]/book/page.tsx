"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const steps = ["Dates", "Payment", "Confirm"];

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/vehicles/1" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to vehicle
          </Link>

          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream">Book Vehicle</h1>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${
                    i <= step ? "bg-brand-gold-400" : "bg-charcoal/10 dark:bg-white/10"
                  }`} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">Pickup Date</label>
                      <input type="date" className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">Return Date</label>
                      <input type="date" className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50" />
                    </div>
                  </div>

                  <div className="glass rounded-premium p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60 dark:text-cream/60">Price per day</span>
                      <span className="text-charcoal dark:text-cream">KES 8,500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60 dark:text-cream/60">Number of days</span>
                      <span className="text-charcoal dark:text-cream">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60 dark:text-cream/60">Platform fee (15%)</span>
                      <span className="text-charcoal dark:text-cream">KES 3,825</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-charcoal/10 dark:border-white/10">
                      <span className="text-charcoal dark:text-cream">Total</span>
                      <span className="text-brand-gold-400">KES 29,325</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="glass rounded-premium p-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-brand-gold-400/10 flex items-center justify-center mx-auto mb-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Safaricom_logo.png" alt="M-Pesa" className="h-10" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-1">M-Pesa</h3>
                    <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-4">Pay securely with M-Pesa STK Push</p>
                    <div className="text-left space-y-3">
                      <input type="tel" placeholder="M-Pesa phone number (e.g. 0712345678)"
                        className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50" />
                      <div className="flex items-start gap-2 text-xs text-charcoal/50 dark:text-cream/50">
                        <Check className="h-3 w-3 mt-0.5 shrink-0 text-brand-gold-400" />
                        <span>You will receive an STK push prompt on your phone to confirm payment of KES 29,325</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <Check className="h-10 w-10 text-green-500" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-charcoal dark:text-cream">Booking Confirmed!</h2>
                  <p className="text-sm text-charcoal/60 dark:text-cream/60">
                    Your booking has been confirmed. You can view the details in your dashboard.
                  </p>
                  <div className="glass rounded-premium p-4 text-left space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-charcoal/60 dark:text-cream/60">Reference</span><span className="font-mono text-charcoal dark:text-cream">CRU-20240701-001</span></div>
                    <div className="flex justify-between text-sm"><span className="text-charcoal/60 dark:text-cream/60">Vehicle</span><span className="text-charcoal dark:text-cream">Mercedes-Benz E-Class</span></div>
                    <div className="flex justify-between text-sm"><span className="text-charcoal/60 dark:text-cream/60">Amount Paid</span><span className="font-heading font-bold text-brand-gold-400">KES 29,325</span></div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {step < 2 ? (
                <Button size="sm" onClick={handleSubmit} loading={loading}>
                  {step === 0 ? "Continue to Payment" : "Pay KES 29,325"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Link href="/dashboard/renter/trips">
                  <Button size="sm">View My Trips</Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
