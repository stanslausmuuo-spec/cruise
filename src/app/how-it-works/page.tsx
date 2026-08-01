"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Search, Calendar, Key, Car, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse Vehicles",
    desc: "Explore our curated selection of premium vehicles. Filter by type, price, and location to find the perfect ride.",
  },
  {
    icon: Calendar,
    title: "Book Your Dates",
    desc: "Select your pick-up and drop-off dates. Secure the booking with a simple, transparent payment process.",
  },
  {
    icon: ShieldCheck,
    title: "Get Verified",
    desc: "Complete a quick verification to unlock your booking. Your safety and trust are our priority.",
  },
  {
    icon: Key,
    title: "Pick Up & Drive",
    desc: "Meet the host, inspect the vehicle, and drive off. Enjoy a premium experience from start to finish.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <Car className="h-10 w-10 text-brand-gold-400 mx-auto mb-4" />
            <h1 className="font-heading text-4xl font-bold text-charcoal dark:text-cream mb-4">
              How It Works
            </h1>
            <p className="text-lg text-charcoal/60 dark:text-cream/60 max-w-2xl mx-auto">
              Renting a car on CruiseLinx is simple. Follow these four easy steps to get behind the wheel.
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="glass rounded-2xl p-6 flex gap-5"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-brand-gold-400/10 flex items-center justify-center shrink-0">
                    <s.icon className="h-5 w-5 text-brand-gold-400" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-charcoal/10 dark:bg-white/10 mt-2" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-brand-gold-400">STEP {i + 1}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 dark:text-cream/60">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href={ROUTES.VEHICLES}>
              <Button size="lg">Browse Cars</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
