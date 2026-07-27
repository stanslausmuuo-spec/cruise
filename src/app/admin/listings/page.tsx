"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Filter, Car, Eye, Trash2, Edit, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Vehicle } from "@/lib/types";

export default function AdminListingsPage() {
  const vehiclesData = useQuery(api.vehicles.listVehicles, { limit: 100 });
  const currentUser = useQuery(api.auth.getMe);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "featured">("all");

  const deleteVehicle = useMutation(api.vehicles.deleteVehicle);

  if (vehiclesData === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="search" />
      </div>
    );
  }

  const filteredVehicles = (vehiclesData?.vehicles ?? []).filter((vehicle: Vehicle) => {
    const matchesSearch = !search ||
      vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.address.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && vehicle.isActive) ||
      (statusFilter === "inactive" && !vehicle.isActive) ||
      (statusFilter === "featured" && vehicle.isFeatured);

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (vehicleId: string) => {
    if (confirm("Are you sure you want to delete this vehicle listing? This action cannot be undone.")) {
      try {
        await deleteVehicle({ vehicleId: vehicleId as Id<"vehicles"> });
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
        alert("Failed to delete vehicle");
      }
    }
  };

  const statusLabel = (vehicle: Vehicle) => {
    if (vehicle.isFeatured) return "Featured";
    if (vehicle.isActive) return "Active";
    return "Inactive";
  };

  const statusVariant = (vehicle: Vehicle) => {
    if (vehicle.isFeatured) return "featured";
    if (vehicle.isActive) return "verified";
    return "status";
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <BackLink href="/admin" />
            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mt-2">
              Manage Listings
            </h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
              <input
                type="text"
                placeholder="Search by make, model, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive" | "featured")}
                className="appearance-none pl-10 pr-8 py-2 rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {filteredVehicles.length === 0 ? (
          <EmptyState
            icon={<Car className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title={search || statusFilter !== "all" ? "No listings found" : "No listings yet"}
            description={search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Vehicle listings will appear here once hosts add them"}
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {filteredVehicles.map((vehicle: Vehicle) => (
              <motion.div key={vehicle._id} variants={fadeUp}>
                <div className="glass rounded-premium p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-charcoal/5 dark:bg-white/5 flex-shrink-0">
                      {vehicle.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vehicle.images[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                      ) : (
                        <Car className="h-8 w-8 mx-auto my-3 text-charcoal/30 dark:text-cream/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-charcoal dark:text-cream truncate">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <Badge variant={statusVariant(vehicle)}>
                          {statusLabel(vehicle)}
                        </Badge>
                      </div>
                      <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-1">
                        {vehicle.year} &bull; {vehicle.transmission} &bull; {vehicle.fuelType} &bull; {vehicle.seats} seats
                      </p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50 truncate">
                        {vehicle.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-brand-gold-400 text-lg">
                        {formatCurrency(vehicle.pricePerDay)}
                        <span className="font-normal text-sm text-charcoal/50 dark:text-cream/50">/day</span>
                      </p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                        {formatDate(vehicle.createdAt, "short")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => window.open(`/vehicles/${vehicle._id}`, "_blank")}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => window.open(`/vehicles/${vehicle._id}/edit`, "_blank")}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(vehicle._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}