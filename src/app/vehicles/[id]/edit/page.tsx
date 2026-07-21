"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackLink } from "@/components/ui/back-link";
import { VehicleTypeSelector } from "@/components/vehicles/vehicle-type-selector";
import { formatCurrency, calculatePercentage, calculateHostEarnings } from "@/lib/utils";
import { TRANSMISSION_TYPES, FUEL_TYPES, TRANSMISSION_LABELS, FUEL_TYPE_LABELS } from "@/lib/constants";
import { ChevronLeft, ChevronRight, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { FileUpload } from "@/components/ui/file-upload";
import type { VehicleType, Transmission, FuelType } from "@/lib/types";
import type { Id } from "convex/_generated/dataModel";

const steps = ["Details", "Photos", "Pricing", "Review"];

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  const { toast } = useToast();
  const currentUser = useQuery(api.auth.getMe);
  const vehicle = useQuery(api.vehicles.getVehicle, { vehicleId: vehicleId as Id<"vehicles"> });
  const updateVehicle = useMutation(api.vehicles.updateVehicle);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [localEdits, setLocalEdits] = useState<Partial<{
    make: string;
    model: string;
    year: number;
    type: VehicleType;
    transmission: Transmission;
    fuelType: FuelType;
    seats: number;
    pricePerDay: number;
    address: string;
    description: string;
    features: string[];
  }>>({});
  const [newFeature, setNewFeature] = useState("");
  const [localImageEdits, setLocalImageEdits] = useState<string[] | null>(null);
  const uploadedImages = localImageEdits ?? vehicle?.images ?? [];

  useEffect(() => {
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser, router]);

  const form = useMemo(() => {
    const defaults = {
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
    };

    const vehicleData = vehicle ? {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      seats: vehicle.seats,
      pricePerDay: vehicle.pricePerDay,
      address: vehicle.address,
      description: vehicle.description,
      features: vehicle.features ?? [],
    } : defaults;

    return { ...vehicleData, ...localEdits };
  }, [vehicle, localEdits]);

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setLocalEdits((f) => ({ ...f, [field]: value }));

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
    if (!currentUser) {
      toast("error", "Not authenticated", "Please sign in to edit this vehicle");
      return;
    }

    if (!vehicle || vehicle.ownerId !== currentUser._id) {
      toast("error", "Not authorized", "You can only edit your own vehicles");
      return;
    }

    setLoading(true);
    try {
      await updateVehicle({
        vehicleId: vehicleId as Id<"vehicles">,
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
        features: form.features,
        images: uploadedImages,
      });
      toast("success", "Vehicle updated!", "Your changes have been saved");
      router.push(`/vehicles/${vehicleId}`);
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      toast("error", "Failed to update vehicle", error instanceof Error ? error.message : "Please try again");
    } finally {
      setLoading(false);
    }
  };

  if (vehicle === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <BackLink href="/dashboard/host/vehicles" />
          <div className="glass rounded-2xl p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-brand-gold-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (vehicle === null) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <BackLink href="/dashboard/host/vehicles" />
          <div className="glass rounded-2xl p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-charcoal dark:text-cream font-medium">Vehicle not found</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push("/dashboard/host/vehicles")}>
              Back to Vehicles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser && vehicle.ownerId !== currentUser._id) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <BackLink href="/dashboard/host/vehicles" />
          <div className="glass rounded-2xl p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-charcoal dark:text-cream font-medium">Not authorized</p>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-1">You can only edit your own vehicles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <BackLink href={`/vehicles/${vehicleId}`} />

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
            Edit Vehicle
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
                <FileUpload
                  label="Upload vehicle photos (max 10)"
                  accept="image/png,image/jpeg,image/webp"
                  maxFiles={10}
                  maxSizeMB={10}
                  onFilesChange={(fileStates) => {
                    const validImages = fileStates
                      .filter((f) => f.storageId && !f.error)
                      .map((f) => f.storageId!);
                    setLocalImageEdits(validImages);
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
                    Features
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
                <div className="glass rounded-premium p-3 space-y-2">
                  <p className="text-xs text-charcoal/60 dark:text-cream/60 flex justify-between">
                    <span>Platform fee (15%)</span>
                    <span className="font-medium text-charcoal dark:text-cream">
                      {formatCurrency(calculatePercentage(form.pricePerDay))}
                    </span>
                  </p>
                  <p className="text-xs text-charcoal/60 dark:text-cream/60 flex justify-between">
                    <span>You earn</span>
                    <strong className="font-heading font-bold text-brand-gold-400">
                      {formatCurrency(calculateHostEarnings(form.pricePerDay))} /day
                    </strong>
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
              {step === 3 ? "Save Changes" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
