"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Search, CreditCard, Car } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Drive",
    description:
      "Browse verified vehicles near you. Filter by type, price, and availability to find the perfect ride.",
  },
  {
    icon: CreditCard,
    title: "Secure Booking",
    description:
      "Book instantly and pay securely with M-Pesa. Your payment is protected until the trip begins.",
  },
  {
    icon: Car,
    title: "Hit the Road",
    description:
      "Pick up your vehicle, inspect it with photo capture, and enjoy the drive. Return with ease.",
  },
];

export function HowItWorks() {
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
            Simple Process
          </p>
          <h2 className="text-charcoal dark:text-cream">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              className="text-center relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-gold-400/50 to-transparent" />
              )}
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full glass mb-6 border border-brand-gold-400/20">
                <step.icon className="h-10 w-10 text-brand-gold-400" />
              </div>
              <h3 className="font-heading text-xl mb-3 text-charcoal dark:text-cream">
                {step.title}
              </h3>
              <p className="text-sm text-charcoal/60 dark:text-cream/60 max-w-xs mx-auto leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
