"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackLink } from "@/components/ui/back-link";
import { VehicleTypeSelector } from "@/components/vehicles/vehicle-type-selector";
import { formatCurrency, calculatePlatformFee } from "@/lib/utils";
import { TRANSMISSION_TYPES, FUEL_TYPES, TRANSMISSION_LABELS, FUEL_TYPE_LABELS } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import type { VehicleType, Transmission, FuelType } from "@/lib/types";

const steps = ["Details", "Photos", "Pricing", "Review"];

export default function NewVehiclePage() {
  const router = useRouter();
  const createVehicle = useMutation(api.vehicles.createVehicle);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: 2024,
    type: "sedan" as VehicleType,
    transmission: "automatic" as Transmission,
    fuelType: "petrol" as FuelType,
    seats: 5,
    pricePerDay: 0,
    address: "",
    description: "",
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState("");

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addFeature = () => {
    if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
      update("features", [...form.features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    update("features", form.features.filter((f) => f !== feature));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createVehicle({
        ownerId: "placeholder" as any,
        make: form.make,
        model: form.model,
        year: form.year,
        type: form.type,
        transmission: form.transmission,
        fuelType: form.fuelType,
        seats: form.seats,
        pricePerDay: form.pricePerDay,
        address: form.address,
        description: form.description,
        features: form.features.length > 0 ? form.features : undefined,
      });
      router.push("/dashboard/host/vehicles");
    } catch (error) {
      console.error("Failed to create vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <BackLink href="/dashboard/host/vehicles" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    i <= step ? "bg-brand-gold-400" : "bg-charcoal/10 dark:bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-1">
            List Your Vehicle
          </h1>
          <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-8">
            {steps[step]}
          </p>

          <div className="space-y-5">
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Make" placeholder="e.g. Toyota" value={form.make} onChange={(e) => update("make", e.target.value)} />
                  <Input label="Model" placeholder="e.g. Land Cruiser" value={form.model} onChange={(e) => update("model", e.target.value)} />
                </div>
                <Input label="Year" type="number" value={form.year} onChange={(e) => update("year", parseInt(e.target.value))} />
                <VehicleTypeSelector value={form.type} onChange={(type) => update("type", type)} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                      Transmission
                    </label>
                    <div className="flex gap-2">
                      {TRANSMISSION_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => update("transmission", t)}
                          className={`flex-1 px-4 py-2 rounded-pill text-sm transition-all ${
                            form.transmission === t
                              ? "bg-brand-gold-400 text-white"
                              : "glass hover:border-brand-gold-400/30"
                          }`}
                        >
                          {TRANSMISSION_LABELS[t] || t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                      Fuel Type
                    </label>
                    <div className="flex gap-2">
                      {FUEL_TYPES.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => update("fuelType", f)}
                          className={`flex-1 px-4 py-2 rounded-pill text-sm transition-all ${
                            form.fuelType === f
                              ? "bg-brand-gold-400 text-white"
                              : "glass hover:border-brand-gold-400/30"
                          }`}
                        >
                          {FUEL_TYPE_LABELS[f] || f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Input label="Seats" type="number" value={form.seats} onChange={(e) => update("seats", parseInt(e.target.value))} />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="border-2 border-dashed border-charcoal/20 dark:border-white/20 rounded-2xl p-12 text-center hover:border-brand-gold-400/50 transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-charcoal/30 dark:text-cream/30" />
                  <p className="text-sm text-charcoal/60 dark:text-cream/60">Upload vehicle photos</p>
                  <p className="text-xs text-charcoal/40 dark:text-cream/40 mt-1">PNG, JPG or WebP up to 10MB</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                    Features (optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g. Leather Seats"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      Add
                    </Button>
                  </div>
                  {form.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-400/10 text-brand-gold-400 text-xs font-medium px-3 py-1"
                        >
                          {feature}
                          <button onClick={() => removeFeature(feature)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <Input
                  label="Price per day (KES)"
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.pricePerDay || ""}
                  onChange={(e) => update("pricePerDay", parseInt(e.target.value) || 0)}
                />
                <div>
                  <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                    Location
                  </label>
                  <Input
                    placeholder="Enter pickup address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your vehicle..."
                    rows={4}
                    className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="glass rounded-premium p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/60 dark:text-cream/60">Make/Model</span>
                    <span className="font-medium text-charcoal dark:text-cream">
                      {form.make || "—"} {form.model}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/60 dark:text-cream/60">Type</span>
                    <span className="capitalize font-medium text-charcoal dark:text-cream">
                      {form.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/60 dark:text-cream/60">Price</span>
                    <span className="font-heading font-bold text-brand-gold-400">
                      {formatCurrency(form.pricePerDay)} /day
                    </span>
                  </div>
                </div>
                <div className="glass rounded-premium p-3">
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">
                    Platform fee: 15%. You earn:{" "}
                    <strong className="text-charcoal dark:text-cream">
                      {formatCurrency(calculatePlatformFee(form.pricePerDay, 0.85))}
                    </strong>{" "}
                    /day
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              size="sm"
              loading={loading}
              onClick={() => (step < 3 ? setStep((s) => s + 1) : handleSubmit())}
            >
              {step === 3 ? "Submit Listing" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
