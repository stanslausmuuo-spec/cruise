"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { ShieldCheck, Camera, Lock, BadgeCheck } from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Identity Verified",
    description: "All users undergo KYC verification. Hosts and renters are who they say they are.",
  },
  {
    icon: ShieldCheck,
    title: "Vehicle Inspected",
    description: "Vehicle logbooks verified. Condition documented with photo check-in/out.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Payments processed instantly via M-Pesa. Funds held securely until trip completion.",
  },
  {
    icon: Camera,
    title: "Photo Protection",
    description: "Time-stamped photos at pickup and return protect both parties.",
  },
];

export function TrustSection() {
  return (
    <section className="min-h-screen snap-start flex items-center py-20 px-4">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-brand-gold-400 font-medium text-sm tracking-widest uppercase mb-3">
            Trust & Safety
          </p>
          <h2 className="text-charcoal dark:text-cream">
            Trust Built <span className="text-gradient-gold">In</span>
          </h2>
          <p className="text-charcoal/60 dark:text-cream/60 mt-4 max-w-2xl mx-auto">
            Every ride is protected by our verification system, secure payments, and photo documentation.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="glass rounded-premium p-6 text-center"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand-gold-400/10 mb-4">
                <feature.icon className="h-6 w-6 text-brand-gold-400" />
              </div>
              <h3 className="font-heading text-base font-bold text-charcoal dark:text-cream mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-charcoal/60 dark:text-cream/60 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
