"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, MapPin, Phone, Send } from "lucide-react";

const contactMethods = [
  { icon: Mail, label: "Email", value: "hello@cruiselinx.com" },
  { icon: Phone, label: "Phone", value: "+254 712 345 678" },
  { icon: MapPin, label: "Location", value: "Nairobi, Kenya" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

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
              Contact Us
            </h1>
            <p className="text-lg text-charcoal/60 dark:text-cream/60">
              We would love to hear from you. Get in touch with our team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {contactMethods.map((m) => (
              <div
                key={m.label}
                className="glass rounded-2xl p-5 text-center"
              >
                <m.icon className="h-6 w-6 text-brand-gold-400 mx-auto mb-2" />
                <p className="text-xs text-charcoal/50 dark:text-cream/50 mb-1">
                  {m.label}
                </p>
                <p className="text-sm font-medium text-charcoal dark:text-cream">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-8 max-w-lg mx-auto">
            {sent ? (
              <div className="text-center py-8">
                <Send className="h-10 w-10 text-brand-gold-400 mx-auto mb-3" />
                <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-2">
                  Message Sent!
                </h2>
                <p className="text-sm text-charcoal/60 dark:text-cream/60">
                  We will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="h-5 w-5 text-brand-gold-400" />
                  <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                    Send a Message
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input id="name" label="Name" placeholder="Your name" />
                    <Input id="email" label="Email" type="email" placeholder="you@example.com" />
                  </div>
                  <Input id="subject" label="Subject" placeholder="How can we help?" />
                  <div className="w-full">
                    <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 focus:border-brand-gold-400/50"
                      placeholder="Tell us more..."
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" icon={<Send className="h-4 w-4" />}>
                    Send Message
                  </Button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
