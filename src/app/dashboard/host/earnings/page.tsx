"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Wallet, CalendarDays } from "lucide-react";

export default function EarningsPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-8">
          <span className="text-gradient-gold">Earnings</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card glass className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-gold-400/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-brand-gold-400" />
              </div>
              <div>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Total Earnings</p>
                <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">KES 242,000</p>
              </div>
            </div>
          </Card>
          <Card glass className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-gold-400/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-brand-gold-400" />
              </div>
              <div>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">This Month</p>
                <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">KES 64,000</p>
              </div>
            </div>
          </Card>
          <Card glass className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-gold-400/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-brand-gold-400" />
              </div>
              <div>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Upcoming Payouts</p>
                <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">KES 32,000</p>
              </div>
            </div>
          </Card>
        </div>

        <Card glass className="p-6">
          <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">Recent Transactions</h2>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-charcoal/5 dark:border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium text-charcoal dark:text-cream">Booking #{i} — Vehicle Name</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">July {i}, 2024</p>
              </div>
              <p className="text-sm font-heading font-bold text-green-500">+KES {Math.floor(Math.random() * 20000 + 5000).toLocaleString()}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
