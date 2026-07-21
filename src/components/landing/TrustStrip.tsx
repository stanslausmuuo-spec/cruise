"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Star, Shield, Zap, Users, Headphones } from "lucide-react";

const trustBadges = [
  {
    icon: ShieldCheck,
    label: "Verified Hosts",
    desc: "ID & license verified",
  },
  {
    icon: Shield,
    label: "Secure Payments",
    desc: "M-Pesa protected",
  },
  {
    icon: Star,
    label: "Quality Vehicles",
    desc: "Inspected & maintained",
  },
  {
    icon: Users,
    label: "Growing Community",
    desc: "Join car owners & renters",
  },
  {
    icon: Zap,
    label: "Instant Book",
    desc: "No waiting for approval",
  },
  {
    icon: Headphones,
    label: "Support",
    desc: "We are here to help",
  },
];

export function TrustStrip() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex items-center gap-3 p-4 glass rounded-xl hover:border-brand-gold-400/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-gold-400/10 flex items-center justify-center shrink-0">
                <badge.icon className="h-5 w-5 text-brand-gold-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-charcoal dark:text-cream">
                  {badge.label}
                </p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">
                  {badge.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
