"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { VehicleMap } from "@/components/vehicles/VehicleMap";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { AlertCircle, Clock } from "lucide-react";

export default function VehicleMapPage() {
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitChecked, setRateLimitChecked] = useState(false);
  const [rateLimitReset, setRateLimitReset] = useState(0);

  const vehiclesData = useQuery(api.vehicles.listVehicles, { limit: 500 });
  const checkMapAccess = useMutation(api.vehicles.checkMapAccess);

  useEffect(() => {
    checkMapAccess({})
      .then((result) => {
        if (!result.allowed) {
          setRateLimited(true);
          setRateLimitReset(result.resetTime);
        }
        setRateLimitChecked(true);
      })
      .catch(() => {
        setRateLimitChecked(true);
      });
  }, [checkMapAccess]);

  const vehicles = vehiclesData?.vehicles ?? [];

  if (rateLimited) {
    const retryAfter = Math.max(1, Math.ceil((rateLimitReset - Date.now()) / 60000));
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
              Vehicle <span className="text-gradient-gold">Map</span>
            </h1>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-charcoal dark:text-cream mb-2">
              Too many requests
            </h2>
            <p className="text-charcoal/60 dark:text-cream/60 max-w-md mx-auto">
              You&apos;ve accessed the map too frequently. Please wait{" "}
              <strong className="text-amber-500">{retryAfter} minute{retryAfter !== 1 ? "s" : ""}</strong>{" "}
              before trying again.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
