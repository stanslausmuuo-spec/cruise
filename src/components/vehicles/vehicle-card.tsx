"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Settings, Fuel } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { VEHICLE_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import type { Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  href?: string;
}

function VehicleCard({ vehicle, href }: VehicleCardProps) {
  const link = href || `/vehicles/${vehicle._id}`;
  const imageUrl = vehicle.images[0] || "/placeholder-car.jpg";

  return (
    <Link href={link}>
      <Card className="group h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={vehicle.type === "luxury" ? "premium" : "status"}>
              {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
            </Badge>
          </div>
          {vehicle.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="featured">Featured</Badge>
            </div>
          )}
          {vehicle.isVerified && (
            <div className="absolute bottom-3 left-3 glass rounded-pill px-2 py-0.5 flex items-center gap-1">
              <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
              <span className="text-xs font-medium text-charcoal dark:text-cream">
                Verified
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>
          <p className="text-sm text-charcoal/50 dark:text-cream/50 mb-3">
            {vehicle.year} &middot; {vehicle.seats} seats
          </p>
          <div className="flex items-center gap-3 text-xs text-charcoal/50 dark:text-cream/50 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {vehicle.address}
            </span>
            <span className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              {TRANSMISSION_LABELS[vehicle.transmission] || vehicle.transmission}
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="h-3 w-3" />
              {vehicle.fuelType}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-charcoal/5 dark:border-white/5">
            <span className="font-heading text-xl font-bold text-brand-gold-400">
              {formatCurrency(vehicle.pricePerDay)}
              <span className="text-xs font-normal text-charcoal/50 dark:text-cream/50">
                {" "}/day
              </span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { VehicleCard };
