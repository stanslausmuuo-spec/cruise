"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { ArrowLeft } from "lucide-react";

const trips = [
  { id: "1", vehicle: "Mercedes-Benz E-Class", startDate: "2024-07-15", endDate: "2024-07-18", status: "upcoming", amount: 29325, image: "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=300&q=80" },
  { id: "2", vehicle: "Range Rover Velar", startDate: "2024-06-20", endDate: "2024-06-22", status: "completed", amount: 24000, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=300&q=80" },
  { id: "3", vehicle: "BMW 7 Series", startDate: "2024-06-10", endDate: "2024-06-12", status: "cancelled", amount: 30000, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=80" },
];

export default function TripsPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">My <span className="text-gradient-gold">Trips</span></h1>
        </div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
          {trips.map((trip, i) => (
            <motion.div key={trip.id} variants={fadeUp}>
              <Link href={`/bookings/${trip.id}`}>
                <Card glass className="flex gap-4 p-4">
                  <div className="h-20 w-28 rounded-xl overflow-hidden shrink-0">
                    <img src={trip.image} alt={trip.vehicle} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-charcoal dark:text-cream">{trip.vehicle}</h3>
                      <Badge variant={trip.status === "completed" ? "verified" : trip.status === "upcoming" ? "featured" : "status"}>
                        {trip.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                      {trip.startDate} → {trip.endDate}
                    </p>
                    <p className="text-sm font-heading font-bold text-brand-gold-400 mt-1">
                      KES {trip.amount.toLocaleString()}
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
