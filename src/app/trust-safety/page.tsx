"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, CreditCard, HeadphonesIcon, FileCheck, Users } from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Verified Hosts & Vehicles",
    desc: "Every host and vehicle on Cruise goes through a thorough verification process to ensure quality and authenticity.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    desc: "All transactions are processed through our secure payment system. Your payment info is encrypted and protected.",
  },
  {
    icon: ShieldCheck,
    title: "Protection Coverage",
    desc: "Every booking includes protection coverage for both guests and hosts, giving you peace of mind on every trip.",
  },
  {
    icon: FileCheck,
    title: "Identity Verification",
    desc: "We verify the identity of all users through government-issued ID checks to maintain a trusted community.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    desc: "Our dedicated support team is available around the clock to help with any issues before, during, or after your trip.",
  },
  {
    icon: Users,
    title: "Community Guidelines",
    desc: "Clear guidelines and standards ensure respectful and safe interactions between all members of our community.",
  },
];

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <ShieldCheck className="h-10 w-10 text-brand-gold-400 mx-auto mb-4" />
            <h1 className="font-heading text-4xl font-bold text-charcoal dark:text-cream mb-4">
              Trust & Safety
            </h1>
            <p className="text-lg text-charcoal/60 dark:text-cream/60 max-w-2xl mx-auto">
              Your safety is our priority. We built Cruise to be the most trusted car rental marketplace.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 border border-glass-border-light dark:border-glass-border-dark"
              >
                <f.icon className="h-8 w-8 text-brand-gold-400 mb-3" />
                <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-charcoal/60 dark:text-cream/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
