"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, Check, AlertTriangle } from "lucide-react";

export default function CheckOutPage() {
  const [step, setStep] = useState(0);
  const [damage, setDamage] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/bookings/1" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-6">Check-Out</h1>

          <Card glass className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 0 ? "bg-brand-gold-400 text-white" : "glass"
              }`}>1</div>
              <div>
                <p className="font-medium text-sm text-charcoal dark:text-cream">Capture Return Photos</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Document vehicle condition</p>
              </div>
              {step > 0 && <Check className="ml-auto h-5 w-5 text-green-500" />}
            </div>

            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? "bg-brand-gold-400 text-white" : "glass"
              }`}>2</div>
              <div>
                <p className="font-medium text-sm text-charcoal dark:text-cream">Any Damage?</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Flag any issues found</p>
              </div>
              {step > 1 && <Check className="ml-auto h-5 w-5 text-green-500" />}
            </div>

            {step === 1 && (
              <div className="flex gap-3">
                <button onClick={() => { setDamage(false); setStep(2); }}
                  className="flex-1 p-4 rounded-premium glass hover:border-green-500/50 transition-all text-center">
                  <Check className="h-6 w-6 mx-auto mb-1 text-green-500" />
                  <span className="text-xs font-medium">No Damage</span>
                </button>
                <button onClick={() => { setDamage(true); setStep(2); }}
                  className="flex-1 p-4 rounded-premium glass hover:border-red-500/50 transition-all text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-red-500" />
                  <span className="text-xs font-medium">Report Damage</span>
                </button>
              </div>
            )}

            <div className="border-t border-charcoal/10 dark:border-white/10 pt-4">
              {step === 0 && (
                <Button className="w-full" onClick={() => setStep(1)} icon={<Camera className="h-4 w-4" />}>
                  Take Return Photos
                </Button>
              )}
              {step === 2 && (
                <div className="text-center">
                  {damage ? (
                    <div>
                      <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                      <p className="font-medium text-charcoal dark:text-cream">Damage Reported</p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">A dispute will be opened for review</p>
                    </div>
                  ) : (
                    <div>
                      <Check className="h-10 w-10 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-charcoal dark:text-cream">Return Complete!</p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">Thank you for returning the vehicle</p>
                    </div>
                  )}
                  <Link href="/dashboard/renter/trips">
                    <Button variant="outline" size="sm" className="mt-4">Back to Trips</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
