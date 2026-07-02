"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Car, CalendarClock, MessageSquare, Star, Wallet, Settings, LogOut, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar name="John Doe" size="lg" verified />
            <div>
              <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream">Welcome, John</h1>
              <p className="text-sm text-charcoal/60 dark:text-cream/60">Renter &middot; Host</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/renter/trips">
              <Button size="sm" icon={<CalendarClock className="h-4 w-4" />}>My Trips</Button>
            </Link>
            <Link href="/dashboard/host/vehicles">
              <Button variant="outline" size="sm" icon={<Car className="h-4 w-4" />}>My Vehicles</Button>
            </Link>
            <Link href="/dashboard/host/earnings">
              <Button variant="outline" size="sm" icon={<Wallet className="h-4 w-4" />}>Earnings</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={fadeUp}>
            <Card glass className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-brand-gold-400/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-brand-gold-400" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">2</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Active Bookings</p>
                </div>
              </div>
              <Link href="/dashboard/renter/trips" className="text-xs text-brand-gold-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card glass className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-brand-gold-400/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-brand-gold-400" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">3</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Unread Messages</p>
                </div>
              </div>
              <Link href="/messages" className="text-xs text-brand-gold-400 hover:underline flex items-center gap-1">
                Open inbox <ChevronRight className="h-3 w-3" />
              </Link>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card glass className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-brand-gold-400/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-brand-gold-400" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">4.9</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Average Rating</p>
                </div>
              </div>
              <Link href="/profile" className="text-xs text-brand-gold-400 hover:underline flex items-center gap-1">
                View profile <ChevronRight className="h-3 w-3" />
              </Link>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/vehicles/new" className="p-4 rounded-premium border border-charcoal/5 dark:border-white/5 hover:border-brand-gold-400/30 transition-all text-center">
              <Car className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
              <p className="text-xs font-medium text-charcoal dark:text-cream">List a Car</p>
            </Link>
            <Link href="/vehicles" className="p-4 rounded-premium border border-charcoal/5 dark:border-white/5 hover:border-brand-gold-400/30 transition-all text-center">
              <CalendarClock className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
              <p className="text-xs font-medium text-charcoal dark:text-cream">Book a Car</p>
            </Link>
            <Link href="/messages" className="p-4 rounded-premium border border-charcoal/5 dark:border-white/5 hover:border-brand-gold-400/30 transition-all text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
              <p className="text-xs font-medium text-charcoal dark:text-cream">Messages</p>
            </Link>
            <Link href="/profile" className="p-4 rounded-premium border border-charcoal/5 dark:border-white/5 hover:border-brand-gold-400/30 transition-all text-center">
              <Settings className="h-6 w-6 mx-auto mb-2 text-brand-gold-400" />
              <p className="text-xs font-medium text-charcoal dark:text-cream">Settings</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
