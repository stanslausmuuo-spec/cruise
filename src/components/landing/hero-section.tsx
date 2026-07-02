"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight } from "lucide-react";

const HeroScene = dynamic(() => import("./hero-scene").then((mod) => ({ default: mod.HeroScene })), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-brand-gold-400/20 via-transparent to-surface-light dark:to-surface-dark" />
  ),
});

export function HeroSection() {
  return (
    <section className="relative min-h-screen snap-start flex items-center justify-center overflow-hidden">
      <HeroScene />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-brand-gold-400 font-medium text-sm md:text-base tracking-widest uppercase mb-4"
          >
            Premium P2P Car Rental Marketplace
          </motion.p>

          <h1 className="text-gradient-gold mb-6">
            Drive Luxury.
            <br />
            <span className="text-charcoal dark:text-cream">Own Freedom.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-charcoal/60 dark:text-cream/60 max-w-2xl mx-auto mb-10 font-body"
          >
            Browse verified vehicles, book securely with M-Pesa, and drive away.
            The premium peer-to-peer car rental experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/vehicles">
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Explore Cars
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">
                List Your Car
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 text-charcoal/30 dark:text-cream/30 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
