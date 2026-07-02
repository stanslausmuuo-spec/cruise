"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone, MessageSquare, Camera, CheckCircle, Clock } from "lucide-react";

const booking = {
  id: "1",
  vehicle: "Mercedes-Benz E-Class",
  image: "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=600&q=80",
  host: "James Mwangi",
  startDate: "July 15, 2024",
  endDate: "July 18, 2024",
  status: "confirmed",
  totalAmount: 29325,
  reference: "CRU-20240701-001",
  location: "Nairobi, Kenya",
};

export default function BookingDetailPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/renter/trips" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to trips
          </Link>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <img src={booking.image} alt={booking.vehicle} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="font-heading text-2xl font-bold text-white">{booking.vehicle}</h1>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5" /> {booking.location}
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="featured">{booking.status}</Badge>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-premium p-3 text-center">
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Pickup</p>
                  <p className="text-sm font-medium text-charcoal dark:text-cream">{booking.startDate}</p>
                </div>
                <div className="glass rounded-premium p-3 text-center">
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Return</p>
                  <p className="text-sm font-medium text-charcoal dark:text-cream">{booking.endDate}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60 dark:text-cream/60">Reference</span>
                  <span className="font-mono text-charcoal dark:text-cream">{booking.reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60 dark:text-cream/60">Host</span>
                  <span className="text-charcoal dark:text-cream">{booking.host}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60 dark:text-cream/60">Total Paid</span>
                  <span className="font-heading font-bold text-brand-gold-400">KES {booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/bookings/${booking.id}/check-in`} className="flex-1">
                  <Button className="w-full" size="sm" icon={<Camera className="h-4 w-4" />}>
                    Check-In
                  </Button>
                </Link>
                <Link href={`/bookings/${booking.id}/check-out`} className="flex-1">
                  <Button variant="outline" size="sm" icon={<CheckCircle className="h-4 w-4" />}>
                    Check-Out
                  </Button>
                </Link>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" icon={<Phone className="h-4 w-4" />}>
                  Contact Host
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" icon={<MessageSquare className="h-4 w-4" />}>
                  Chat
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-charcoal/40 dark:text-cream/40">
              This booking data is cached offline for your convenience.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
