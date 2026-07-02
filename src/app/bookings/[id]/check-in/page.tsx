"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, Check } from "lucide-react";

export default function CheckInPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/bookings/1" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-6">Check-In</h1>

          <Card glass className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 0 ? "bg-brand-gold-400 text-white" : "glass"
              }`}>1</div>
              <div>
                <p className="font-medium text-sm text-charcoal dark:text-cream">Capture Odometer</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Take a photo of current mileage</p>
              </div>
              {step > 0 && <Check className="ml-auto h-5 w-5 text-green-500" />}
            </div>

            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? "bg-brand-gold-400 text-white" : "glass"
              }`}>2</div>
              <div>
                <p className="font-medium text-sm text-charcoal dark:text-cream">Vehicle Exterior</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Capture all sides of the vehicle</p>
              </div>
              {step > 1 && <Check className="ml-auto h-5 w-5 text-green-500" />}
            </div>

            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? "bg-brand-gold-400 text-white" : "glass"
              }`}>3</div>
              <div>
                <p className="font-medium text-sm text-charcoal dark:text-cream">Confirm Pickup</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Both parties confirm handover</p>
              </div>
              {step > 2 && <Check className="ml-auto h-5 w-5 text-green-500" />}
            </div>

            <div className="border-t border-charcoal/10 dark:border-white/10 pt-4">
              {step < 3 ? (
                <Button className="w-full" onClick={() => setStep((s) => s + 1)} icon={<Camera className="h-4 w-4" />}>
                  {step === 0 ? "Take Odometer Photo" : step === 1 ? "Take Exterior Photos" : "Confirm Pickup"}
                </Button>
              ) : (
                <div className="text-center">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-charcoal dark:text-cream">Check-In Complete</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">Enjoy your drive!</p>
                  <Link href="/bookings/1"><Button variant="outline" size="sm" className="mt-4">Back to Booking</Button></Link>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
