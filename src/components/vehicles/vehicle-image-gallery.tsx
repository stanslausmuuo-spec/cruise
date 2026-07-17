"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { VEHICLE_TYPE_LABELS } from "@/lib/constants";
import type { Vehicle } from "@/lib/types";

interface VehicleImageGalleryProps {
  vehicle: Vehicle;
}

function VehicleImageGallery({ vehicle }: VehicleImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const images = vehicle.images.length > 0
    ? vehicle.images
    : ["/placeholder-car.jpg"];

  const next = () => setSelectedIndex((i) => (i + 1) % images.length);
  const prev = () => setSelectedIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden h-[300px] md:h-[450px]"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={images[selectedIndex]}
            alt={`${vehicle.make} ${vehicle.model}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute top-4 left-4">
          <Badge variant="premium" size="md">
            {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
          </Badge>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button className="glass rounded-full p-2 hover:bg-white/80 dark:hover:bg-black/80 transition-colors">
            <Heart className="h-4 w-4 text-charcoal dark:text-cream" />
          </button>
          <button className="glass rounded-full p-2 hover:bg-white/80 dark:hover:bg-black/80 transition-colors">
            <Share2 className="h-4 w-4 text-charcoal dark:text-cream" />
          </button>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 glass rounded-full p-2 hover:bg-white/80 dark:hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-charcoal dark:text-cream" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 glass rounded-full p-2 hover:bg-white/80 dark:hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-charcoal dark:text-cream" />
            </button>
          </>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-pill px-3 py-1 text-xs text-charcoal dark:text-cream">
          {selectedIndex + 1} / {images.length}
        </div>
      </motion.div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === selectedIndex
                  ? "border-brand-gold-400"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`View ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { VehicleImageGallery };
