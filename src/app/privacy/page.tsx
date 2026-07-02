"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Mail } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content:
      "We collect information you provide when creating an account, listing a vehicle, or making a booking. This includes your name, email address, phone number, payment information, and vehicle details. We also automatically collect usage data such as IP address, browser type, and pages visited to improve our service.",
  },
  {
    icon: Lock,
    title: "How We Use Your Information",
    content:
      "Your information is used to facilitate bookings, process payments, verify identities, communicate with you about your trips, and improve our platform. We never sell your personal data to third parties.",
  },
  {
    icon: Shield,
    title: "Data Protection",
    content:
      "We implement industry-standard security measures including encryption, secure socket layer technology (SSL), and regular security audits to protect your personal information. Payment data is processed securely through our payment partners and is never stored on our servers in plain text.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    content:
      "If you have any questions about this privacy policy or how your data is handled, please contact our privacy team at privacy@cruise.com.",
  },
];

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((s) => (
              <div
                key={s.title}
                className="glass rounded-2xl p-6 border border-glass-border-light dark:border-glass-border-dark"
              >
                <div className="flex items-center gap-3 mb-3">
                  <s.icon className="h-5 w-5 text-brand-gold-400 shrink-0" />
                  <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                    {s.title}
                  </h2>
                </div>
                <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed">
                  {s.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
