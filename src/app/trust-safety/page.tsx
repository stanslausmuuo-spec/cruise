"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, CreditCard, HeadphonesIcon, FileCheck, Users } from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Verified Hosts & Vehicles",
    desc: "Every host and vehicle on CruiseLinx goes through a thorough verification process to ensure quality and authenticity.",
  },
  {
    icon: CreditCard,
    title: "Direct Payments, No Middleman",
    desc: "You pay hosts directly — cash or M-Pesa person-to-person. CruiseLinx never handles rental money, so there are no hidden fees or middleman markups.",
  },
  {
    icon: ShieldCheck,
    title: "Documented Check-In & Check-Out",
    desc: "Every rental is documented with check-in and check-out photos. If damage is reported, the evidence is recorded for fair dispute resolution.",
  },
  {
    icon: FileCheck,
    title: "Identity Verification",
    desc: "We verify the identity of all users through government-issued ID checks before they can host or rent.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support & Disputes",
    desc: "Our team helps resolve disputes using booking records, chat history, and check-in/check-out photos as evidence.",
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
            <p className="text-lg text-charcoal/75 dark:text-cream/75 max-w-2xl mx-auto">
              Your safety is our priority. Every user is verified, every rental is documented,
              and every dispute is resolved with evidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6"
              >
                <f.icon className="h-8 w-8 text-brand-gold-400 mb-3" />
                <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-2">
                  {f.title}
                </h2>
                <p className="text-sm text-charcoal/75 dark:text-cream/75">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
