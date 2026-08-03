"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleSearchBar } from "@/components/vehicles/vehicle-search-bar";
import { FilterPanel } from "@/components/vehicles/filter-panel";
import { ActiveFilterTags } from "@/components/vehicles/active-filter-tags";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { PRICE_RANGES } from "@/lib/constants";
import type { VehicleType } from "@/lib/types";

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    types: [] as string[],
    transmissions: [] as string[],
    counties: [] as string[],
    priceRange: null as number | null,
    minPrice: "",
    maxPrice: "",
  });
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [vehicles, setVehicles] = useState<Doc<"vehicles">[]>([]);

  const queryArgs = {
    type: filters.types.length === 1 ? filters.types[0] as VehicleType : undefined,
    transmission: filters.transmissions.length === 1 ? filters.transmissions[0] as "automatic" | "manual" : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    cursor,
    limit: 20,
  };

  const result = useQuery(api.vehicles.listVehicles, queryArgs);

  const serverFilterKey = JSON.stringify({
    type: queryArgs.type,
    transmission: queryArgs.transmission,
    minPrice: queryArgs.minPrice,
    maxPrice: queryArgs.maxPrice,
  });

  const [previousFilterKey, setPreviousFilterKey] = useState(serverFilterKey);

  if (serverFilterKey !== previousFilterKey) {
    setPreviousFilterKey(serverFilterKey);
    setCursor(undefined);
    setVehicles([]);
  }

  useEffect(() => {
    if (result === undefined) return;
    const frame = requestAnimationFrame(() => {
      if (cursor === undefined) {
        setVehicles(result.vehicles);
      } else {
        setVehicles((prev) => [...prev, ...result.vehicles]);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [result, cursor]);

  useEffect(() => {
    if (isLoadingMore && result !== undefined) {
      const frame = requestAnimationFrame(() => setIsLoadingMore(false));
      return () => cancelAnimationFrame(frame);
    }
  }, [result, isLoadingMore]);

  const clearFilters = useCallback(() => {
    setFilters({
      types: [],
      transmissions: [],
      counties: [],
      priceRange: null,
      minPrice: "",
      maxPrice: "",
    });
    setSearch("");
    setCursor(undefined);
    setVehicles([]);
  }, []);

  const loadMore = useCallback(() => {
    if (!result?.nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setCursor(result.nextCursor);
  }, [result, isLoadingMore]);

  const activeFilterCount =
    filters.types.length +
    filters.transmissions.length +
    filters.counties.length +
    (filters.priceRange !== null ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  const filtered = useMemo(() => {
    return vehicles.filter((v: typeof vehicles[0]) => {
      const matchesSearch =
        !debouncedSearch ||
        v.make.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        v.model.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType = !filters.types.length || filters.types.includes(v.type);
      const matchesTransmission = !filters.transmissions.length || filters.transmissions.includes(v.transmission);
      const matchesCounty = !filters.counties.length || filters.counties.some((c) => v.address.toLowerCase().includes(c.toLowerCase()));
      const matchesPriceRange =
        filters.priceRange === null ||
        (v.pricePerDay >= PRICE_RANGES[filters.priceRange].min &&
          v.pricePerDay <= PRICE_RANGES[filters.priceRange].max);

      return matchesSearch && matchesType && matchesTransmission && matchesCounty && matchesPriceRange;
    });
  }, [vehicles, debouncedSearch, filters]);

  if (result === undefined) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
            Browse <span className="text-brand-gold-400">Vehicles</span>
          </h1>
          <div className="mt-8">
            <SkeletonScreen type="search" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
              Browse <span className="text-brand-gold-400">Vehicles</span>
            </h1>
            <p className="text-charcoal/60 dark:text-cream/60 mt-1">
              {filtered.length} vehicle{filtered.length !== 1 && "s"} available
            </p>
          </div>
          <div className="flex items-center gap-3">
            <VehicleSearchBar value={search} onChange={setSearch} />
            <Button
              variant={activeFilterCount > 0 ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-white/20">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mb-8"
            >
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
                activeCount={activeFilterCount}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ActiveFilterTags
          types={filters.types}
          transmissions={filters.transmissions}
          counties={filters.counties}
          priceRange={filters.priceRange}
          priceRanges={PRICE_RANGES}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onRemoveType={(t) => setFilters((f) => ({ ...f, types: f.types.filter((x) => x !== t) }))}
          onRemoveTransmission={(t) => setFilters((f) => ({ ...f, transmissions: f.transmissions.filter((x) => x !== t) }))}
          onRemoveCounty={(c) => setFilters((f) => ({ ...f, counties: f.counties.filter((x) => x !== c) }))}
          onRemovePriceRange={() => setFilters((f) => ({ ...f, priceRange: null }))}
          onRemoveCustomPrice={() => setFilters((f) => ({ ...f, minPrice: "", maxPrice: "" }))}
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No vehicles found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((vehicle: typeof filtered[0]) => (
                <motion.div key={vehicle._id} variants={fadeUp}>
                  <VehicleCard vehicle={vehicle} />
                </motion.div>
              ))}
            </motion.div>

            {result?.hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  icon={isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}