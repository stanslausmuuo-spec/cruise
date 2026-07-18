"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HeroSearchBar } from "./HeroSearchBar";
import { FeaturedCarsCarousel } from "./FeaturedCarsCarousel";
import { TrustStrip } from "./TrustStrip";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen snap-start flex items-center justify-center overflow-hidden">
      {/* Gradient fallback - replaces Three.js scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-gold-400/20 via-transparent to-surface-light dark:to-surface-dark" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
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
            Find Your Perfect Car
            <br />
            <span className="text-charcoal dark:text-cream">In Seconds.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-charcoal/60 dark:text-cream/60 max-w-2xl mx-auto mb-10 font-body"
          >
            Search verified vehicles, book instantly with M-Pesa, and drive away.
            The premium peer-to-peer car rental experience.
          </motion.p>

          {/* Search Bar - Primary Action */}
          <HeroSearchBar />

          {/* Featured Cars - Social Proof + Scarcity */}
          <FeaturedCarsCarousel limit={3} />

          {/* Trust Strip - Authority Signals */}
          <TrustStrip />

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <svg className="h-6 w-6 text-charcoal/30 dark:text-cream/30 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}