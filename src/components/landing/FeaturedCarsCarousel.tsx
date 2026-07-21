"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowRight, Shield, Star, MapPin } from "lucide-react";
import { VEHICLE_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

interface FeaturedCarsCarouselProps {
  limit?: number;
}

function FeaturedCarsCarousel({ limit = 3 }: FeaturedCarsCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const vehiclesData = useQuery(api.vehicles.listVehicles, {
    limit: limit * 2,
    type: "luxury",
  });

  const featuredVehicles: Vehicle[] = (vehiclesData?.vehicles ?? []).filter((v: Vehicle) => v.isFeatured && v.isActive).slice(0, limit);

  const next = () => setSelectedIndex((i) => (i + 1) % featuredVehicles.length);
  const prev = () => setSelectedIndex((i) => (i - 1 + featuredVehicles.length) % featuredVehicles.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prev();
      else next();
    }
    setTouchStart(null);
  };

  if (!vehiclesData || featuredVehicles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-gold-400 font-medium text-sm tracking-widest uppercase mb-2">
              Premium Selection
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-charcoal dark:text-cream">
              Featured <span className="text-gradient-gold">Fleet</span>
            </h2>
          </div>
          <Link href="/vehicles">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
              View All Fleet
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-8"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {featuredVehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="min-w-[320px] md:min-w-[380px] flex-shrink-0"
              >
                <Link href={`/vehicles/${vehicle._id}`}>
                  <Card className="group overflow-hidden h-full flex flex-col">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={vehicle.images[0] || "/placeholder-car.jpg"}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="featured">Featured</Badge>
                        {vehicle.isVerified && (
                          <Badge variant="verified" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 glass rounded-pill px-2.5 py-1 flex items-center gap-1">
                        <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
                        <span className="text-xs font-medium text-charcoal dark:text-cream">
                          4.9
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-charcoal/50 dark:text-cream/50">
                            {vehicle.year} &middot; {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
                          </p>
                        </div>
                        <Badge variant="premium" size="sm">
                          {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-3 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {vehicle.address}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-charcoal/5 dark:border-white/5">
                        <span className="font-heading text-xl font-bold text-brand-gold-400">
                          {formatCurrency(vehicle.pricePerDay)}
                          <span className="text-xs font-normal text-charcoal/50 dark:text-cream/50"> /day</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {featuredVehicles.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === selectedIndex
                    ? "bg-brand-gold-400 w-8"
                    : "bg-charcoal/20 dark:bg-white/20 hover:bg-brand-gold-400/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { FeaturedCarsCarousel };