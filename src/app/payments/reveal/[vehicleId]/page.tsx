"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone, Check, Lock } from "lucide-react";

export default function RevealPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(1);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-md mx-auto">
        <Link href="/vehicles/1" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card glass className="p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-brand-gold-400/10 flex items-center justify-center mx-auto mb-4">
              {step === 0 ? (
                <Lock className="h-8 w-8 text-brand-gold-400" />
              ) : (
                <Check className="h-8 w-8 text-green-500" />
              )}
            </div>

            <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-2">
              {step === 0 ? "Reveal Host Contact" : "Phone Number Revealed!"}
            </h2>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-6">
              {step === 0
                ? "Pay a small fee to unlock the host's direct phone number for quick coordination."
                : "You can now contact the host directly."}
            </p>

            {step === 0 ? (
              <div className="space-y-4">
                <div className="glass rounded-premium p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-charcoal/60 dark:text-cream/60">Reveal Fee</span>
                    <span className="font-heading font-bold text-brand-gold-400">KES 100</span>
                  </div>
                  <Input label="M-Pesa Phone Number" type="tel" placeholder="0712345678" icon={<Phone className="h-4 w-4" />} />
                </div>
                <Button className="w-full" onClick={handlePay} loading={loading}>
                  Pay KES 100 to Reveal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="glass rounded-premium p-4">
                  <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">+254 712 345 678</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">This number is now cached for offline access</p>
                </div>
                <Link href="/messages/1">
                  <Button className="w-full" variant="outline">
                    Send Message Instead
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
