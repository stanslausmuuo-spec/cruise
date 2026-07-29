"use client";

import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { VehicleImageGallery } from "@/components/vehicles/vehicle-image-gallery";
import { VehicleSpecsBar } from "@/components/vehicles/vehicle-specs-bar";
import { VehicleFeatures } from "@/components/vehicles/vehicle-features";
import { VehiclePriceCard } from "@/components/vehicles/vehicle-price-card";
import { HostCard } from "@/components/vehicles/host-card";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { MapPin, Star } from "lucide-react";
import type { Vehicle } from "@/lib/types";

interface PublicUser {
  _id: string;
  name?: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
}

interface VehicleDetailContentProps {
  vehicle: Vehicle;
  owner?: PublicUser;
}

function VehicleDetailContent({ vehicle, owner }: VehicleDetailContentProps) {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <BackLink href="/vehicles" label="Back to vehicles" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <VehicleImageGallery vehicle={vehicle} />

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
              <motion.div variants={fadeUp}>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
                  {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-charcoal/60 dark:text-cream/60">
                  <span>{vehicle.year}</span>
                  <span className="w-1 h-1 rounded-full bg-charcoal/30 dark:bg-cream/30" />
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {vehicle.address}
                  </span>
                  {owner && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-charcoal/30 dark:bg-cream/30" />
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-brand-gold-400 fill-brand-gold-400" />
                        {owner.rating} ({owner.reviewCount} reviews)
                      </span>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <VehicleSpecsBar
                  fuelType={vehicle.fuelType}
                  transmission={vehicle.transmission}
                  seats={vehicle.seats}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-3">
                  Description
                </h2>
                <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed">
                  {vehicle.description}
                </p>
              </motion.div>

              {vehicle.features && vehicle.features.length > 0 && (
                <motion.div variants={fadeUp}>
                  <VehicleFeatures features={vehicle.features} />
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <VehiclePriceCard vehicle={vehicle} />
              {owner && <HostCard host={owner} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { VehicleDetailContent };
