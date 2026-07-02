"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Smartphone, WifiOff, Bell, Zap } from "lucide-react";

const features = [
  { icon: WifiOff, label: "Offline Mode" },
  { icon: Bell, label: "Push Notifications" },
  { icon: Zap, label: "Fast Loading" },
  { icon: Smartphone, label: "Installable PWA" },
];

export function CTASection() {
  return (
    <section className="min-h-screen snap-start flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-gold-400/5 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 glass rounded-pill px-4 py-2 mb-8 border border-brand-gold-400/20">
          <Smartphone className="h-4 w-4 text-brand-gold-400" />
          <span className="text-xs font-medium text-charcoal/70 dark:text-cream/70">
            Progressive Web App — No Download Required
          </span>
        </div>

        <h2 className="text-charcoal dark:text-cream mb-4">
          Your Fleet. <span className="text-gradient-gold">Everywhere.</span>
        </h2>

        <p className="text-lg text-charcoal/60 dark:text-cream/60 mb-8 max-w-xl mx-auto">
          Install Cruise for offline access, instant notifications, and a seamless experience
          across all your devices.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {features.map((f) => (
            <div
              key={f.label}
              className="inline-flex items-center gap-2 glass rounded-pill px-4 py-2 text-xs font-medium text-charcoal/70 dark:text-cream/70"
            >
              <f.icon className="h-3.5 w-3.5 text-brand-gold-400" />
              {f.label}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/vehicles">
            <Button variant="outline" size="lg">
              Browse Vehicles
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
