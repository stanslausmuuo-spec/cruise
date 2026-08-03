"use client";

import { motion } from "framer-motion";
import { Car, Shield, Users, Award } from "lucide-react";

const values = [
  {
    icon: Car,
    title: "Premium Selection",
    desc: "Every vehicle on CruiseLinx is verified for quality, ensuring you drive nothing but the best.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    desc: "Secure payments, verified hosts, and 24/7 support for every trip.",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "A marketplace built on trust between car owners and travelers.",
  },
  {
    icon: Award,
    title: "Excellence",
    desc: "We hold ourselves to the highest standards of service and reliability.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl font-bold text-charcoal dark:text-cream mb-4">
              About CruiseLinx
            </h1>
            <p className="text-lg text-charcoal/60 dark:text-cream/60 max-w-2xl mx-auto">
              We are on a mission to transform car rental — making it seamless, trusted, and accessible to everyone.
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-charcoal/70 dark:text-cream/70 mb-12">
            <p>
              CruiseLinx is a peer-to-peer car rental marketplace that connects car owners with travelers
              looking for a premium driving experience. Whether you need a luxury sedan for a business
              trip, an SUV for a weekend getaway, or something unique for a special occasion, CruiseLinx
              has you covered.
            </p>
            <p>
              Founded with the belief that car rental should be flexible, affordable, and trustworthy,
              we have built a platform that puts safety and transparency first. Every listing is vetted,
              every transaction is secure, and every trip is backed by our dedicated support team.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {values.map((v) => (
              <div
                key={v.title}
                className="glass rounded-2xl p-6"
              >
                <v.icon className="h-8 w-8 text-brand-gold-400 mb-3" />
                <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-2">
                  {v.title}
                </h2>
                <p className="text-sm text-charcoal/60 dark:text-cream/60">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
