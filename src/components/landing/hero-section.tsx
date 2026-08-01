"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
          alt="Car on a road at dusk"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-24"
      >
        <div className="max-w-2xl">
          <p className="text-brand-gold-400 font-medium text-sm tracking-widest uppercase mb-5">
            Rent cars from owners near you
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
            Cars in your city,
            <br />
            ready to <span className="text-brand-gold-400">drive</span>
          </h1>

          <p className="text-lg text-white/70 max-w-lg mb-10 leading-relaxed">
            Book instantly with M-Pesa from verified hosts. Pay per day, in KES, with no hidden fees.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
            <Link
              href="/vehicles"
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand-gold-500 px-8 py-4 text-base font-medium text-white hover:brightness-110 transition-all shadow-premium"
            >
              Find a Car
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/vehicles/new"
              className="inline-flex items-center justify-center rounded-pill border border-white/40 px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-colors"
            >
              List your car
            </Link>
          </div>

          <p className="text-sm text-white/50">
            Verified hosts &middot; M-Pesa protected &middot; Photo check-in/out
          </p>
        </div>
      </motion.div>
    </section>
  );
}
