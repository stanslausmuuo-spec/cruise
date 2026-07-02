"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Monitor, ShieldCheck, Star, Car, CalendarClock } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <Avatar name="John Doe" size="lg" verified className="mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream">John Doe</h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">john@example.com &middot; +254 712 345 678</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="verified">Verified</Badge>
              <div className="flex items-center gap-1 text-sm text-charcoal/60 dark:text-cream/60">
                <Star className="h-3.5 w-3.5 text-brand-gold-400 fill-brand-gold-400" />
                4.9 (42 reviews)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card glass className="p-4 text-center">
              <Car className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
              <p className="text-lg font-heading font-bold text-charcoal dark:text-cream">2</p>
              <p className="text-xs text-charcoal/50 dark:text-cream/50">Vehicles</p>
            </Card>
            <Card glass className="p-4 text-center">
              <CalendarClock className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
              <p className="text-lg font-heading font-bold text-charcoal dark:text-cream">12</p>
              <p className="text-xs text-charcoal/50 dark:text-cream/50">Trips</p>
            </Card>
            <Card glass className="p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
              <p className="text-lg font-heading font-bold text-charcoal dark:text-cream">4.9</p>
              <p className="text-xs text-charcoal/50 dark:text-cream/50">Rating</p>
            </Card>
          </div>

          <div className="space-y-4">
            <Card glass className="p-5">
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">Theme</h2>
              <div className="flex gap-3">
                {[
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "system", icon: Monitor, label: "System" },
                ].map((t) => (
                  <button key={t.value} className="flex-1 p-3 rounded-premium border border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/30 transition-all text-center">
                    <t.icon className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
                    <span className="text-xs font-medium text-charcoal dark:text-cream">{t.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card glass className="p-5">
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">KYC Status</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-charcoal dark:text-cream">Identity Verified</p>
                    <p className="text-xs text-charcoal/50 dark:text-cream/50">ID & License uploaded</p>
                  </div>
                </div>
                <Badge variant="verified">Approved</Badge>
              </div>
            </Card>

            <Button variant="outline" className="w-full">Edit Profile</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
