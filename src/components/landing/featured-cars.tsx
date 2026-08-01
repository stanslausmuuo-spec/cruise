"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Car } from "lucide-react";

export function FeaturedCars() {
  const featured = useQuery(api.vehicles.listVehicles, { tier: "premium", limit: 4 });
  const recent = useQuery(api.vehicles.listVehicles, { limit: 4 });
  const featuredVehicles = featured?.vehicles ?? [];
  const recentVehicles = recent?.vehicles ?? [];
  const vehicles = featuredVehicles.length > 0 ? featuredVehicles : recentVehicles;

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-charcoal dark:text-cream">
              Featured vehicles
            </h2>
            <p className="text-charcoal/60 dark:text-cream/60 mt-2">
              Cars their owners chose to promote — book them first.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-gold-400 hover:text-brand-gold-500 transition-colors"
          >
            View all cars
          </Link>
        </motion.div>

        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Car className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="No cars listed yet"
            description="Be the first host on Cruise and start earning from your car today."
            action={
              <Link
                href="/vehicles/new"
                className="inline-flex items-center justify-center rounded-pill bg-brand-gold-500 px-6 py-3 text-sm font-medium text-white hover:brightness-110 transition-all"
              >
                List your car
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}
