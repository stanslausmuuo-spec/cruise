"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { ArrowLeft, Plus, Edit3, Eye } from "lucide-react";

const vehicles = [
  { id: "1", name: "Toyota Land Cruiser", year: 2023, status: "active", bookings: 12, earnings: 114000, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58d7?w=300&q=80" },
  { id: "2", name: "Lexus LS 500", year: 2024, status: "active", bookings: 8, earnings: 128000, image: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=300&q=80" },
];

export default function HostVehiclesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">My <span className="text-gradient-gold">Vehicles</span></h1>
          </div>
          <Link href="/vehicles/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add Vehicle</Button>
          </Link>
        </div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
          {vehicles.map((v, i) => (
            <motion.div key={v.id} variants={fadeUp}>
              <Card glass className="flex gap-4 p-4">
                <div className="h-20 w-28 rounded-xl overflow-hidden shrink-0">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-charcoal dark:text-cream">{v.name}</h3>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">{v.year}</p>
                    </div>
                    <Badge variant={v.status === "active" ? "verified" : "status"}>{v.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-charcoal/50 dark:text-cream/50">
                    <span>{v.bookings} bookings</span>
                    <span className="font-medium text-brand-gold-400">KES {v.earnings.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Edit3 className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Eye className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
