"use client";

import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin } from "lucide-react";

export default function VehicleMapPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <BackLink href="/vehicles" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[calc(100vh-200px)] rounded-2xl overflow-hidden glass"
        >
          <EmptyState
            icon={<MapPin className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="Map View Coming Soon"
            description="We're working on integrating Mapbox for nearby vehicle discovery. In the meantime, browse vehicles using the list view."
          />
        </motion.div>
      </div>
    </div>
  );
}
