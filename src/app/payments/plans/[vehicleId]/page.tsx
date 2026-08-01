"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, Check, Star, Phone, Crown, ShieldCheck, ArrowRight } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { useToast } from "@/components/ui/toast";
import { PLANS, getPlan, type PlanTier, type PlanPeriod } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";
import { useState, useEffect } from "react";

const PLAN_DAYS: Record<PlanPeriod, number> = { monthly: 30, annual: 365 };

export default function PlansPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as Id<"vehicles">;
  const { toast } = useToast();

  const currentUser = useQuery(api.auth.getMe);
  const vehicle = useQuery(
    api.vehicles.getVehicle,
    vehicleId ? { vehicleId } : "skip"
  );
  const createPlanPurchase = useMutation(api.payments.createPlanPurchase);

  const [step, setStep] = useState<"input" | "polling" | "success" | "error">("input");
  const [period, setPeriod] = useState<PlanPeriod>("annual");
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
            toast("success", "Your car is in the spotlight!", "Your plan is now active.");
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
          <p className="text-charcoal/60 dark:text-cream/60 mb-4">Please sign in to promote your vehicle.</p>
          <a href="/login" className="inline-flex items-center justify-center rounded-pill font-medium transition-colors duration-200 bg-brand-gold-500 text-white hover:brightness-110 shadow-premium px-5 py-2.5 text-sm">
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

  const currentTier = (vehicle.tier ?? "free") as PlanTier;
  const isOwner = currentUser._id === vehicle.ownerId;

  const handleSelect = async (tier: PlanTier) => {
    if (tier === "free") {
      router.push("/dashboard/host/vehicles");
      return;
    }
    setError("");
    setStep("polling");
    setPollCount(0);

    const selected = getPlan(tier);
    const amount = period === "annual" ? selected.annualFee : selected.monthlyFee;

    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: currentUser.phone,
          amount,
          accountReference: `FEAT-${vehicleId.slice(0, 8)}`,
          transactionDesc: "CruiseLinx plan",
          type: "featured",
          metadata: {
            vehicleId,
            userId: currentUser._id,
            plan: tier,
            period,
            durationDays: PLAN_DAYS[period],
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutRequestId) {
        setCheckoutRequestId(data.checkoutRequestId);

        await createPlanPurchase({
          vehicleId: vehicleId as never,
          plan: tier as "basic" | "premium",
          period,
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

  const renderStepContent = () => {
    if (step === "polling") {
      return (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 text-brand-gold-400 animate-spin" />
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              Waiting for payment... Check your phone for the M-Pesa prompt
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
        <div className="mt-8 text-center">
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">
            Payment successful! Your car is now in the spotlight.
          </p>
          <Button variant="outline" onClick={() => window.location.href = `/vehicles/${vehicleId}`}>
            View Vehicle
          </Button>
        </div>
      );
    }

    return null;
  };

  const featureList = (tier: PlanTier) => getPlan(tier).features;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <BackLink href="/dashboard/host/vehicles" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
            Get your car <span className="text-brand-gold-400">seen, booked, and driven.</span>
          </h1>
          <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-3 max-w-xl mx-auto">
            {vehicle.make} {vehicle.model} &middot; Three simple ways to rent on CruiseLinx.
            No hidden charges — let your plan expire anytime.
          </p>

          {currentTier !== "free" && isOwner && (
            <div className="inline-flex items-center gap-2 mt-4 rounded-pill border border-brand-gold-400/30 bg-brand-gold-400/10 px-4 py-2 text-sm text-brand-gold-400">
              <Crown className="h-4 w-4" />
              Currently on {getPlan(currentTier).name} — featured until{" "}
              {vehicle.tierExpiresAt
                ? new Date(vehicle.tierExpiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })
                : "soon"}
            </div>
          )}
        </motion.div>

        {/* Billing toggle — annual preselected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <button
            onClick={() => setPeriod("monthly")}
            className={cn(
              "rounded-pill px-5 py-2 text-sm font-medium transition-colors",
              period === "monthly"
                ? "bg-brand-gold-500 text-white"
                : "text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod("annual")}
            className={cn(
              "rounded-pill px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2",
              period === "annual"
                ? "bg-brand-gold-500 text-white"
                : "text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream"
            )}
          >
            Annual
            <span
              className={cn(
                "text-[10px] font-bold rounded-pill px-2 py-0.5",
                period === "annual" ? "bg-white/20" : "bg-brand-gold-400/15 text-brand-gold-400"
              )}
            >
              2 months FREE
            </span>
          </button>
        </motion.div>

        {step === "error" && (
          <div className="max-w-lg mx-auto mb-6 text-sm text-red-500 flex items-center justify-center gap-1">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setStep("input")}>
              Try Again
            </Button>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((p, index) => {
            const feeNow = period === "annual" ? p.annualFee : p.monthlyFee;

            return (
              <motion.div
                key={p.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.07 }}
                className="relative"
              >
                {p.mostPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-pill bg-brand-gold-400 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-premium">
                    Most Popular
                  </div>
                )}
                {p.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-pill bg-charcoal dark:bg-cream px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-cream dark:text-charcoal shadow-premium">
                    Best Value
                  </div>
                )}

                <Card
                  glass
                  className={cn(
                    "h-full p-6 flex flex-col transition-all",
                    p.tier === "premium" &&
                      "ring-2 ring-brand-gold-400/60 md:-translate-y-2 md:scale-[1.02] shadow-premium-hover",
                    p.tier === "free" && "opacity-90"
                  )}
                >
                  <div className="mb-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream">
                        {p.name}
                      </h2>
                      {p.tier === "premium" && <Star className="h-5 w-5 text-brand-gold-400 fill-brand-gold-400" />}
                      {p.tier === "basic" && <Phone className="h-5 w-5 text-brand-gold-400" />}
                    </div>
                    <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-1">
                      {p.tagline}
                    </p>
                  </div>

                  <div className="mb-5">
                    <p className="font-heading text-3xl font-bold text-charcoal dark:text-cream">
                      {feeNow === 0 ? (
                        "KES 0"
                      ) : (
                        <>
                          KES {feeNow.toLocaleString()}
                          <span className="text-sm font-normal text-charcoal/50 dark:text-cream/50">
                            /{period === "annual" ? "yr" : "mo"}
                          </span>
                        </>
                      )}
                    </p>
                    {period === "annual" && p.monthlyFee > 0 && (
                      <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                        <span className="line-through">KES {(p.monthlyFee * 12).toLocaleString()}</span>{" "}
                        — 2 months free
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {featureList(p.tier).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-charcoal/70 dark:text-cream/70">
                        <Check className="h-4 w-4 text-brand-gold-400 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {p.tier === "premium" && (
                    <p className="text-xs text-charcoal/50 dark:text-cream/50 mb-4">
                      Only 4 featured cars on the homepage at a time.
                    </p>
                  )}
                  {p.tier === "basic" && (
                    <p className="text-xs text-charcoal/50 dark:text-cream/50 mb-4">
                      Without it, buyers can only message you — and most never do.
                    </p>
                  )}

                  <Button
                    variant={p.tier === "free" ? "outline" : "primary"}
                    className="w-full"
                    disabled={step === "polling"}
                    onClick={() => handleSelect(p.tier)}
                  >
                    {p.tier === "free"
                      ? "List my car"
                      : p.tier === "basic"
                        ? "Get buyers calling"
                        : "Feature my car"}
                    {p.tier !== "free" && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  {p.tier === "free" && (
                    <p className="text-center text-xs text-charcoal/40 dark:text-cream/40 mt-3">
                      Free forever. No card required.
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {renderStepContent()}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 max-w-2xl mx-auto space-y-4"
        >
          <div className="rounded-2xl border border-brand-gold-400/20 bg-brand-gold-400/5 p-5 text-sm text-charcoal/70 dark:text-cream/70">
            <p className="font-semibold text-charcoal dark:text-cream mb-1">
              The price you see is the price you pay.
            </p>
            <p>
              When your plan expires, your car quietly returns to Free. No lock-in,
              no surprise charges. Your money is never held hostage.
            </p>
          </div>
          <div className="rounded-2xl glass p-5 text-sm text-charcoal/70 dark:text-cream/70">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-gold-400 shrink-0 mt-0.5" />
              <p>
                Every host on CruiseLinx is KYC-verified before listing. Trust is built in —
                pay instantly via M-Pesa STK push, activated in seconds.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
