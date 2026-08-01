"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Search",
    description: "Browse verified cars near you. Filter by type, price, and location.",
  },
  {
    title: "Book with M-Pesa",
    description: "Reserve instantly and pay securely. Funds are held until the trip begins.",
  },
  {
    title: "Drive away",
    description: "Pick up the car, inspect it with photo capture, and hit the road.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-charcoal dark:text-cream">
            Three steps to the road
          </h2>
          <p className="text-charcoal/60 dark:text-cream/60 mt-3 max-w-xl mx-auto">
            Search, book with M-Pesa, and drive away — no queues, no paperwork.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="border border-charcoal/10 dark:border-white/10 rounded-2xl p-8 text-center bg-surface-light dark:bg-surface-dark-muted"
            >
              <p className="font-heading text-4xl font-bold text-brand-gold-400 mb-4">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-charcoal/60 dark:text-cream/60 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
