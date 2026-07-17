"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { PayToRevealFlow } from "@/components/payments/pay-to-reveal-flow";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export default function PayToRevealPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const currentUser = useQuery(api.auth.getMe);
  const vehicle = useQuery(
    api.vehicles.getVehicle,
    vehicleId ? { vehicleId: vehicleId as any } : "skip"
  );

  if (vehicle === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="search" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center py-20">
          <p className="text-charcoal/60 dark:text-cream/60 mb-4">Please sign in to reveal owner details.</p>
          <Link href="/login" className="inline-flex items-center justify-center rounded-pill font-medium transition-colors duration-200 bg-gradient-to-r from-brand-gold-400 to-brand-gold-500 text-white hover:brightness-110 shadow-premium px-5 py-2.5 text-sm">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center py-20">
          <p className="text-charcoal/60 dark:text-cream/60">Vehicle not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <BackLink href={`/vehicles/${vehicleId}`} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-heading text-2xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-2">
            Reveal Owner Details
          </h1>
          <p className="text-sm text-charcoal/60 dark:text-cream/60">
            {vehicle.make} {vehicle.model} &middot; {vehicle.year}
          </p>
        </motion.div>

        <div className="space-y-4">
          <PayToRevealFlow
            vehicleId={vehicleId}
            userId={currentUser._id}
            onSuccess={() => {
              window.location.href = `/vehicles/${vehicleId}`;
            }}
          />

          <Link
            href={`/vehicles/${vehicleId}/book`}
            className="flex items-center justify-center gap-2 glass rounded-premium p-4 hover:shadow-premium-hover transition-shadow"
          >
            <span className="text-sm font-medium text-charcoal dark:text-cream">
              Skip — Book directly without revealing
            </span>
            <ArrowRight className="h-4 w-4 text-charcoal/40 dark:text-cream/40" />
          </Link>
        </div>
      </div>
    </div>
  );
}
