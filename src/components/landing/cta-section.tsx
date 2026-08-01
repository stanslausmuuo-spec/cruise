"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-dark" />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-dark via-brand-gold-400/5 to-surface-dark" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="text-cream mb-4">
            Own a car. <span className="text-brand-gold-400">Make it earn.</span>
          </h2>
          <p className="text-lg text-cream/60 max-w-xl mx-auto">
            Cars spend most of their time parked. Put yours to work, or drive one without owning it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-surface-dark-muted p-8 flex flex-col">
            <h3 className="font-heading text-xl font-bold text-cream mb-3">Own a car?</h3>
            <p className="text-sm text-cream/60 leading-relaxed mb-8">
              List it in minutes and earn from your own schedule. You set the price, we handle
              verification, payments, and protection.
            </p>
            <Link
              href="/vehicles/new"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-pill bg-brand-gold-500 px-6 py-3.5 text-sm font-medium text-white hover:brightness-110 transition-all shadow-premium"
            >
              List your car
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface-dark-muted p-8 flex flex-col">
            <h3 className="font-heading text-xl font-bold text-cream mb-3">Need a drive?</h3>
            <p className="text-sm text-cream/60 leading-relaxed mb-8">
              Find the right car near you and book with M-Pesa in minutes. No queues, no paperwork,
              no long-term commitment.
            </p>
            <Link
              href="/vehicles"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-pill border border-white/30 px-6 py-3.5 text-sm font-medium text-cream hover:bg-white/10 transition-colors"
            >
              Find a car
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
