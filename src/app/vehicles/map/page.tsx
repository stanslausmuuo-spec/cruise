"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { VehicleMap } from "@/components/vehicles/VehicleMap";
import { SkeletonScreen } from "@/components/ui/skeleton";

export default function VehicleMapPage() {
  const vehiclesData = useQuery(api.vehicles.listVehicles, { limit: 500 });
  const vehicles = vehiclesData?.vehicles ?? [];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
            Vehicle <span className="text-gradient-gold">Map</span>
          </h1>
          <p className="text-charcoal/60 dark:text-cream/60 mt-1">
            Explore vehicles by location
          </p>
        </div>

        {vehiclesData === undefined ? (
          <div className="h-[calc(100vh-300px)]">
            <SkeletonScreen type="search" />
          </div>
        ) : (
          <VehicleMap vehicles={vehicles} />
        )}
      </div>
    </div>
  );
}