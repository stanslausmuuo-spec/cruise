"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function MapPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row">
        <div className="hidden md:block w-96 overflow-y-auto p-4 space-y-3 border-r border-charcoal/5 dark:border-white/5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">
              Nearby <span className="text-gradient-gold">Vehicles</span>
            </h2>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} glass className="p-3 mb-3 flex gap-3">
                <div className="h-16 w-24 rounded-lg bg-charcoal/10 dark:bg-white/10 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal dark:text-cream">Vehicle Name</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">KES 5,000/day</p>
                  <p className="flex items-center gap-1 text-xs text-charcoal/40 dark:text-cream/40 mt-1">
                    <MapPin className="h-3 w-3" /> 2.3 km away
                  </p>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>

        <div className="flex-1 relative bg-charcoal/5 dark:bg-white/5 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-charcoal/20 dark:text-cream/20" />
            <p className="text-sm text-charcoal/40 dark:text-cream/40">
              Map view requires Mapbox API key
            </p>
            <p className="text-xs text-charcoal/30 dark:text-cream/30 mt-1">
              Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment
            </p>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-16 left-0 right-0 glass border-t border-glass-border-light dark:border-glass-border-dark p-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Card key={i} glass className="p-2 min-w-[200px] flex gap-2">
              <div className="h-12 w-20 rounded-lg bg-charcoal/10 dark:bg-white/10 shrink-0" />
              <div>
                <p className="text-xs font-medium text-charcoal dark:text-cream">Vehicle</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">KES 5,000/day</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
