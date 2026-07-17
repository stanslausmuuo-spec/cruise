"use client";

import { Fuel, Settings, Users } from "lucide-react";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import type { FuelType, Transmission } from "@/lib/types";

interface VehicleSpecsBarProps {
  fuelType: FuelType;
  transmission: Transmission;
  seats: number;
}

function VehicleSpecsBar({ fuelType, transmission, seats }: VehicleSpecsBarProps) {
  return (
    <div className="flex flex-wrap gap-6 py-4 border-y border-charcoal/5 dark:border-white/5">
      <div className="flex items-center gap-2">
        <Fuel className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
        <span className="text-sm text-charcoal/70 dark:text-cream/70">
          {FUEL_TYPE_LABELS[fuelType] || fuelType}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
        <span className="text-sm text-charcoal/70 dark:text-cream/70">
          {TRANSMISSION_LABELS[transmission] || transmission}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
        <span className="text-sm text-charcoal/70 dark:text-cream/70">
          {seats} seats
        </span>
      </div>
    </div>
  );
}

export { VehicleSpecsBar };
