"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatCurrency } from "@/lib/utils";
import { Plus, Car, Edit3, Eye, Crown, Phone, Sparkles } from "lucide-react";
import { getPlan } from "@/lib/constants";

function HostVehiclesSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <SkeletonScreen type="search" />
    </div>
  );
}

function HostVehiclesContent() {
  const currentUser = useQuery(api.auth.getMe);
  const vehicles = useQuery(
    api.vehicles.getOwnerVehicles,
    currentUser ? { ownerId: currentUser._id } : "skip"
  );

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="search" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink href="/dashboard" />
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold text-brand-gold-400">
            My Vehicles
          </h1>
          <Link href="/vehicles/new">
            <Button size="sm" icon={<Plus className="h-4 w-4" />}>
              Add Vehicle
            </Button>
          </Link>
        </div>

        {vehicles === undefined ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass rounded-premium p-4 flex items-center gap-4">
                <div className="h-20 w-24 rounded-lg bg-charcoal/10 dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-charcoal/10 dark:bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-charcoal/5 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={<Car className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="No vehicles listed"
            description="List your first vehicle to start earning."
          />
        ) : (
          <>
            {vehicles.some((v) => v.isActive && (v.tier ?? "free") === "free") && (
              <div className="mb-6 rounded-2xl border border-brand-gold-400/30 bg-brand-gold-400/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-charcoal dark:text-cream">
                    Your car is buried. Featured cars get seen first.
                  </p>
                  <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-1">
                    Basic lets buyers call you directly — Premium puts you on the homepage.
                    From KES 1,000/month.
                  </p>
                </div>
                <Link href={`/payments/plans/${vehicles.find((v) => v.isActive && (v.tier ?? "free") === "free")!._id}`}>
                  <Button size="sm" icon={<Sparkles className="h-4 w-4" />}>
                    Stand out
                  </Button>
                </Link>
              </div>
            )}

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {vehicles.map((vehicle) => (
              <motion.div key={vehicle._id} variants={fadeUp}>
                <div className="glass rounded-premium p-4 flex items-center gap-4">
                  <div className="h-20 w-24 rounded-lg overflow-hidden shrink-0 bg-charcoal/10 dark:bg-white/10">
                    {vehicle.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-charcoal/30 dark:text-cream/30">
                        <Car className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-charcoal dark:text-cream truncate">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <Badge variant={vehicle.isActive ? "verified" : "status"}>
                      {vehicle.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {(vehicle.tier === "basic" || vehicle.tier === "premium") && (
                      <Badge variant={vehicle.tier === "premium" ? "featured" : "verified"}>
                        {vehicle.tier === "premium" ? "Premium" : "Basic"}
                      </Badge>
                    )}
                    {vehicle.tier === "premium" && (
                      <Badge variant="featured">Featured</Badge>
                    )}
                  </div>
                  <p className="text-xs text-charcoal/60 dark:text-cream/60">
                    {vehicle.year} &middot; {vehicle.seats} seats
                  </p>
                  {(vehicle.tier === "basic" || vehicle.tier === "premium") && vehicle.tierExpiresAt && (
                    <p className="text-xs text-brand-gold-400 mt-1">
                      {getPlan(vehicle.tier).name} until{" "}
                      {new Date(vehicle.tierExpiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  <p className="text-sm font-heading font-bold text-brand-gold-400 mt-1">
                    {formatCurrency(vehicle.pricePerDay)} /day
                  </p>
                </div>
                <div className="flex gap-2">
                  {vehicle.isActive && (
                    <Link href={`/payments/plans/${vehicle._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={vehicle.tier === "premium" ? <Crown className="h-4 w-4" /> : vehicle.tier === "basic" ? <Phone className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      >
                        {vehicle.tier === "free" ? "Promote" : vehicle.tier === "basic" ? "Upgrade" : "Renew"}
                      </Button>
                    </Link>
                  )}
                    <Link href={`/vehicles/${vehicle._id}`}>
                      <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} />
                    </Link>
                    <Link href={`/vehicles/${vehicle._id}/edit`}>
                      <Button variant="ghost" size="sm" icon={<Edit3 className="h-4 w-4" />} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HostVehiclesPage() {
  return (
    <Suspense fallback={<HostVehiclesSkeleton />}>
      <HostVehiclesContent />
    </Suspense>
  );
}
