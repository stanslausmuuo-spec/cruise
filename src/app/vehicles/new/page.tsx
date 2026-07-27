"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackLink } from "@/components/ui/back-link";
import { VehicleTypeSelector } from "@/components/vehicles/vehicle-type-selector";
import { formatCurrency, calculatePercentage, calculateHostEarnings } from "@/lib/utils";
import { TRANSMISSION_TYPES, FUEL_TYPES, TRANSMISSION_LABELS, FUEL_TYPE_LABELS } from "@/lib/constants";
import { ChevronLeft, ChevronRight, X, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { FileUpload } from "@/components/ui/file-upload";
import type { VehicleType, Transmission, FuelType } from "@/lib/types";

const steps = ["Details", "Photos", "Pricing", "Review"];

export default function NewVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
  const currentUser = useQuery(api.auth.getMe);
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [blurDataUrls, setBlurDataUrls] = useState<string[]>([]);

  function generateBlurDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();

      img.onload = () => {
        canvas.width = 20;
        canvas.height = 20;
        ctx?.drawImage(img, 0, 0, 20, 20);
        resolve(canvas.toDataURL("image/jpeg", 0.1));
      };

      img.src = URL.createObjectURL(file);
    });
  }

useEffect(() => {
    if (currentUser === null) {
      router.push("/login");
    } else if (currentUser && currentUser.kycStatus !== "approved") {
      router.push("/profile");
    }
  }, [currentUser, router]);

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
    if (!currentUser) {
      toast("error", "Not authenticated", "Please sign in to list a vehicle");
      return;
    }

    if (currentUser.kycStatus !== "approved") {
      toast("error", "Verification required", "Complete KYC verification before listing vehicles");
      router.push("/profile");
      return;
    }

    if (form.features.length === 0) {
      toast("info", "No features added", "Consider adding some features to make your listing more attractive");
    }

    setLoading(true);
    try {
      await createVehicle({
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
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        blurDataUrls: blurDataUrls.length > 0 ? blurDataUrls : undefined,
      });
      toast("success", "Vehicle listed!", "Your vehicle has been submitted for review");
      router.push("/dashboard/host/vehicles");
    } catch (error) {
      console.error("Failed to create vehicle:", error);
      toast("error", "Failed to list vehicle", error instanceof Error ? error.message : "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <BackLink href="/dashboard/host/vehicles" />

        {currentUser === undefined && (
          <div className="mb-6 p-4 glass rounded-xl border border-brand-gold-400/30 animate-pulse">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 border-2 border-brand-gold-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-charcoal/70 dark:text-cream/70">Loading your profile...</span>
            </div>
          </div>
        )}

        {!currentUser && (
          <div className="mb-6 p-4 glass rounded-xl border border-red-400/30 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Please sign in to list a vehicle</p>
                <p className="text-red-500/80 dark:text-red-400/80 mt-1">You&apos;ll be redirected to login...</p>
              </div>
            </div>
          </div>
        )}

        {currentUser && currentUser.kycStatus !== "approved" && (
          <div className="mb-6 p-4 glass rounded-xl border border-amber-400/30 bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-300">KYC verification required</p>
                <p className="text-amber-600/80 dark:text-amber-400/80 mt-1">
                  Complete your KYC verification to list vehicles. Status:{" "}
                  <span className="capitalize">{currentUser.kycStatus}</span>
                </p>
              </div>
            </div>
          </div>
        )}

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
                <FileUpload
                  label="Upload vehicle photos (max 10)"
                  accept="image/png,image/jpeg,image/webp"
                  maxFiles={10}
                  maxSizeMB={10}
                  onFilesChange={async (fileStates) => {
                    const validImages = fileStates
                      .filter((f) => f.storageId && !f.error)
                      .map((f) => f.storageId!);
                    setUploadedImages(validImages);

                    const blurUrls = await Promise.all(
                      fileStates
                        .filter((f) => f.file && !f.error)
                        .map((f) => generateBlurDataUrl(f.file!))
                    );
                    setBlurDataUrls(blurUrls);
                  }}
                />

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
              {step === 3 ? "Submit Listing" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
