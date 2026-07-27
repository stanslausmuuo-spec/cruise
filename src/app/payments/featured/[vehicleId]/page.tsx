"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, Star } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { useToast } from "@/components/ui/toast";
import { FEATURED_LISTING_FEE, FEATURED_DURATION_DAYS } from "@/lib/constants";
import type { Id } from "convex/_generated/dataModel";
import { useState, useEffect } from "react";

export default function FeaturedListingPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as Id<"vehicles">;
  const { toast } = useToast();

  const currentUser = useQuery(api.auth.getMe);
  const vehicle = useQuery(
    api.vehicles.getVehicle,
    vehicleId ? { vehicleId } : "skip"
  );
  const createFeaturedPayment = useMutation(api.payments.createFeaturedPayment);

  const [step, setStep] = useState<"input" | "polling" | "success" | "error">("input");
  const [duration, setDuration] = useState(FEATURED_DURATION_DAYS);
  const [category, setCategory] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step !== "polling" || !checkoutRequestId) return;

    const pollInterval = setInterval(async () => {
      setPollCount((c) => {
        if (c > 30) {
          clearInterval(pollInterval);
          setStep("error");
          setError("Payment timed out. Please try again.");
        }
        return c + 1;
      });

      try {
        const response = await fetch(`/api/payments/featured/status?checkoutRequestId=${checkoutRequestId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.activated) {
            clearInterval(pollInterval);
            setStep("success");
            toast("success", "Featured Listing Activated!", "Your vehicle is now featured for 7 days");
          }
        }
      } catch {
        // Keep polling
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [step, checkoutRequestId, toast]);

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
          <p className="text-charcoal/60 dark:text-cream/60 mb-4">Please sign in to feature your vehicle.</p>
          <a href="/login" className="inline-flex items-center justify-center rounded-pill font-medium transition-colors duration-200 bg-gradient-to-r from-brand-gold-400 to-brand-gold-500 text-white hover:brightness-110 shadow-premium px-5 py-2.5 text-sm">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <BackLink href="/dashboard/host/vehicles" />
          <EmptyState title="Vehicle not found" description="This vehicle may have been removed or doesn't exist." />
        </div>
      </div>
    );
  }

  const handleFeature = async () => {
    if (!currentUser) return;
    setError("");
    setStep("polling");
    setPollCount(0);

    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: currentUser.phone,
          amount: FEATURED_LISTING_FEE,
          accountReference: `FEAT-${vehicleId.slice(0, 8)}`,
          transactionDesc: "Featured listing",
          type: "featured",
          metadata: { vehicleId, userId: currentUser._id, durationDays: duration, category },
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutRequestId) {
        setCheckoutRequestId(data.checkoutRequestId);

        await createFeaturedPayment({
          vehicleId: vehicleId as never,
          durationDays: duration,
          category: category || undefined,
          checkoutRequestId: data.checkoutRequestId,
        });
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
    }
  };

  // Render step-specific content
  const renderStepContent = () => {
    if (step === "polling") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 text-brand-gold-400 animate-spin" />
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              Waiting for payment... Check your phone for M-Pesa prompt
            </p>
          </div>
          <div className="h-2 bg-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gold-400 animate-pulse"
              style={{ width: `${Math.min((pollCount / 30) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-charcoal/40 dark:text-cream/40">
            {30 - pollCount} seconds remaining...
          </p>
        </div>
      );
    }

    if (step === "success") {
      return (
        <div className="text-center">
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">Payment successful! Your vehicle is now featured.</p>
          <Button variant="outline" onClick={() => window.location.href = `/vehicles/${vehicleId}`}>
            View Vehicle
          </Button>
        </div>
      );
    }

    // input or error step
    return (
      <>
        <Button
          className="w-full"
          onClick={handleFeature}
        >
          Pay KES ${(FEATURED_LISTING_FEE * (duration / 7)).toLocaleString()}
        </Button>

        {error && (
          <div className="text-sm text-red-500 mb-4 flex items-center justify-center gap-1">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setStep("input")}>
              Try Again
            </Button>
          </div>
        )}

        <p className="text-xs text-charcoal/40 dark:text-cream/40 text-center">
          M-Pesa STK Push will be sent to your phone ({currentUser.phone})
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <BackLink href="/dashboard/host/vehicles" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-heading text-2xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-2">
            Feature Your Vehicle
          </h1>
          <p className="text-sm text-charcoal/60 dark:text-cream/60">
            {vehicle.make} {vehicle.model} &middot; {vehicle.year}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card glass className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">
                Featured Listing Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
                  >
                    <option value={7}>7 Days (KES {FEATURED_LISTING_FEE.toLocaleString()})</option>
                    <option value={14}>14 Days (KES {(FEATURED_LISTING_FEE * 2).toLocaleString()})</option>
                    <option value={30}>30 Days (KES {(FEATURED_LISTING_FEE * 4).toLocaleString()})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wedding, Luxury, Airport"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
                  />
                </div>
                <div className="glass rounded-premium p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-charcoal/60 dark:text-cream/60">Featured Fee ({duration} days)</span>
                    <span className="font-heading font-bold text-brand-gold-400">
                      KES {(FEATURED_LISTING_FEE * (duration / 7)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center mb-6">
              <Star className="h-5 w-5 text-brand-gold-400 fill-brand-gold-400" />
              <span className="text-sm font-medium text-charcoal/70 dark:text-cream/70">
                Featured vehicles appear at the top of search results
              </span>
            </div>

            {renderStepContent()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}