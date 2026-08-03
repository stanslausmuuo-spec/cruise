"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Settings, Fuel } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { VEHICLE_TYPE_LABELS, TRANSMISSION_LABELS, FUEL_TYPE_LABELS } from "@/lib/constants";
import type { Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  href?: string;
}

function VehicleCard({ vehicle, href }: VehicleCardProps) {
  const link = href || `/vehicles/${vehicle._id}`;
  const imageUrl = vehicle.images[0] || "/placeholder-car.jpg";

  return (
    <Link href={link} aria-label={`View ${vehicle.make} ${vehicle.model} details`}>
      <Card className="group h-full transition-shadow duration-300 hover:shadow-premium-hover hover:border-brand-gold-400/20">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            loading="lazy"
            decoding="async"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder={vehicle.blurDataUrls?.[0] ? "blur" : undefined}
            blurDataURL={vehicle.blurDataUrls?.[0]}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 left-3">
            <Badge variant={vehicle.type === "luxury" ? "premium" : "status"}>
              {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
            </Badge>
          </div>
          {vehicle.tier === "premium" && (
            <div className="absolute top-3 right-3">
              <Badge variant="featured">Featured</Badge>
            </div>
          )}
          {vehicle.isVerified && (
            <div className="absolute bottom-3 left-3 bg-black/60 border border-white/10 rounded-pill px-2 py-0.5 flex items-center gap-1">
              <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
              <span className="text-xs font-medium text-white">
                Verified
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream group-hover:text-brand-gold-500 transition-colors duration-200">
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
              {FUEL_TYPE_LABELS[vehicle.fuelType] || vehicle.fuelType}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-charcoal/5 dark:border-white/5">
            <span className="font-heading text-xl font-bold text-brand-gold-400 group-hover:text-brand-gold-500 transition-colors duration-200">
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
