"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeUp } from "@/lib/animations";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  X,
  ChevronDown,
  Fuel,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { VEHICLE_TYPES, TRANSMISSION_TYPES, PRICE_RANGES } from "@/lib/constants";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  transmission: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  image: string;
  rating: number;
  location: string;
}

const vehicles: Vehicle[] = [
  { id: "1", make: "Mercedes-Benz", model: "E-Class", year: 2023, type: "luxury", transmission: "automatic", fuelType: "diesel", seats: 5, pricePerDay: 8500, image: "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=600&q=80", rating: 4.9, location: "Nairobi" },
  { id: "2", make: "Range Rover", model: "Velar", year: 2024, type: "suv", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 12000, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80", rating: 4.8, location: "Nairobi" },
  { id: "3", make: "BMW", model: "7 Series", year: 2024, type: "luxury", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 15000, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80", rating: 4.9, location: "Mombasa" },
  { id: "4", make: "Porsche", model: "Cayenne", year: 2023, type: "suv", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 18000, image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", rating: 5.0, location: "Nairobi" },
  { id: "5", make: "Toyota", model: "Land Cruiser", year: 2023, type: "suv", transmission: "automatic", fuelType: "diesel", seats: 7, pricePerDay: 9500, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58d7?w=600&q=80", rating: 4.7, location: "Nairobi" },
  { id: "6", make: "Lexus", model: "LS 500", year: 2024, type: "luxury", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 16000, image: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=600&q=80", rating: 4.9, location: "Nairobi" },
  { id: "7", make: "Toyota", model: "Camry", year: 2023, type: "sedan", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 4500, image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80", rating: 4.6, location: "Nairobi" },
  { id: "8", make: "Nissan", model: "X-Trail", year: 2022, type: "suv", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 5500, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80", rating: 4.5, location: "Mombasa" },
  { id: "9", make: "Volkswagen", model: "Polo", year: 2022, type: "sedan", transmission: "manual", fuelType: "petrol", seats: 5, pricePerDay: 3000, image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80", rating: 4.4, location: "Nairobi" },
  { id: "10", make: "Mercedes-Benz", model: "S-Class", year: 2024, type: "luxury", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 22000, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80", rating: 5.0, location: "Nairobi" },
  { id: "11", make: "Land Rover", model: "Defender", year: 2024, type: "suv", transmission: "automatic", fuelType: "diesel", seats: 7, pricePerDay: 14000, image: "https://images.unsplash.com/photo-1605020420620-20c943d46675?w=600&q=80", rating: 4.8, location: "Nairobi" },
  { id: "12", make: "Rolls-Royce", model: "Ghost", year: 2024, type: "luxury", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 35000, image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=600&q=80", rating: 5.0, location: "Nairobi" },
  { id: "13", make: "Toyota", model: "Hilux", year: 2023, type: "truck", transmission: "manual", fuelType: "diesel", seats: 5, pricePerDay: 7000, image: "https://images.unsplash.com/photo-1583264799780-1a8823b8e7e1?w=600&q=80", rating: 4.6, location: "Mombasa" },
  { id: "14", make: "Subaru", model: "Outback", year: 2023, type: "suv", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 6000, image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&q=80", rating: 4.7, location: "Nairobi" },
  { id: "15", make: "BMW", model: "M4", year: 2024, type: "luxury", transmission: "manual", fuelType: "petrol", seats: 4, pricePerDay: 19000, image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&q=80", rating: 4.9, location: "Nairobi" },
];

const locations = [...new Set(vehicles.map((v) => v.location))];

interface Filters {
  types: string[];
  transmissions: string[];
  locations: string[];
  priceRange: number | null;
  minPrice: string;
  maxPrice: string;
}

const initialFilters: Filters = {
  types: [],
  transmissions: [],
  locations: [],
  priceRange: null,
  minPrice: "",
  maxPrice: "",
};

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const setPriceRange = (index: number | null) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange === index ? null : index,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearch("");
  };

  const activeFilterCount =
    filters.types.length +
    filters.transmissions.length +
    filters.locations.length +
    (filters.priceRange !== null ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  const filtered = useMemo(
    () =>
      vehicles.filter((v) => {
        const matchesSearch =
          !search ||
          v.make.toLowerCase().includes(search.toLowerCase()) ||
          v.model.toLowerCase().includes(search.toLowerCase());

        const matchesType =
          !filters.types.length || filters.types.includes(v.type);

        const matchesTransmission =
          !filters.transmissions.length ||
          filters.transmissions.includes(v.transmission);

        const matchesLocation =
          !filters.locations.length || filters.locations.includes(v.location);

        const matchesPriceRange =
          filters.priceRange === null ||
          (v.pricePerDay >= PRICE_RANGES[filters.priceRange].min &&
            v.pricePerDay <= PRICE_RANGES[filters.priceRange].max);

        const matchesCustomMin =
          !filters.minPrice || v.pricePerDay >= Number(filters.minPrice);

        const matchesCustomMax =
          !filters.maxPrice || v.pricePerDay <= Number(filters.maxPrice);

        return (
          matchesSearch &&
          matchesType &&
          matchesTransmission &&
          matchesLocation &&
          matchesPriceRange &&
          matchesCustomMin &&
          matchesCustomMax
        );
      }),
    [search, filters]
  );

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
              Browse <span className="text-gradient-gold">Vehicles</span>
            </h1>
            <p className="text-charcoal/60 dark:text-cream/60 mt-1">
              {filtered.length} vehicle{filtered.length !== 1 && "s"} available
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 dark:text-cream/40" />
              <input
                type="text"
                placeholder="Search make or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-pill glass border border-glass-border-light dark:border-glass-border-dark pl-10 pr-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
              />
            </div>
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
              <div className="glass rounded-2xl p-6 border border-glass-border-light dark:border-glass-border-dark">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                    Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-brand-gold-400 hover:underline flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60 uppercase tracking-wide mb-3">
                      Vehicle Type
                    </p>
                    <div className="space-y-2">
                      {VEHICLE_TYPES.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={() => toggleFilter("types", type)}
                            className="rounded border-charcoal/20 dark:border-white/20 text-brand-gold-400 focus:ring-brand-gold-400/50"
                          />
                          <span className="text-sm text-charcoal/70 dark:text-cream/70 capitalize group-hover:text-charcoal dark:group-hover:text-cream transition-colors">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60 uppercase tracking-wide mb-3">
                      Transmission
                    </p>
                    <div className="space-y-2">
                      {TRANSMISSION_TYPES.map((t) => (
                        <label
                          key={t}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={filters.transmissions.includes(t)}
                            onChange={() => toggleFilter("transmissions", t)}
                            className="rounded border-charcoal/20 dark:border-white/20 text-brand-gold-400 focus:ring-brand-gold-400/50"
                          />
                          <span className="text-sm text-charcoal/70 dark:text-cream/70 capitalize group-hover:text-charcoal dark:group-hover:text-cream transition-colors">
                            {t}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60 uppercase tracking-wide mb-3">
                      Location
                    </p>
                    <div className="space-y-2">
                      {locations.map((loc) => (
                        <label
                          key={loc}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={filters.locations.includes(loc)}
                            onChange={() => toggleFilter("locations", loc)}
                            className="rounded border-charcoal/20 dark:border-white/20 text-brand-gold-400 focus:ring-brand-gold-400/50"
                          />
                          <span className="text-sm text-charcoal/70 dark:text-cream/70 group-hover:text-charcoal dark:group-hover:text-cream transition-colors">
                            {loc}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60 uppercase tracking-wide mb-3">
                      Price Range
                    </p>
                    <div className="space-y-2 mb-3">
                      {PRICE_RANGES.map((range, i) => (
                        <label
                          key={range.label}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange === i}
                            onChange={() => setPriceRange(i)}
                            className="border-charcoal/20 dark:border-white/20 text-brand-gold-400 focus:ring-brand-gold-400/50"
                          />
                          <span className="text-sm text-charcoal/70 dark:text-cream/70 group-hover:text-charcoal dark:group-hover:text-cream transition-colors">
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minPrice: e.target.value,
                            priceRange: null,
                          }))
                        }
                        className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-3 py-1.5 text-xs text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
                      />
                      <span className="text-xs text-charcoal/40 dark:text-cream/40">
                        -
                      </span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxPrice: e.target.value,
                            priceRange: null,
                          }))
                        }
                        className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-3 py-1.5 text-xs text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {filters.types.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-400/10 text-brand-gold-400 text-xs font-medium px-3 py-1"
              >
                {t}
                <button onClick={() => toggleFilter("types", t)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.transmissions.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-400/10 text-brand-gold-400 text-xs font-medium px-3 py-1"
              >
                {t}
                <button onClick={() => toggleFilter("transmissions", t)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.locations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-400/10 text-brand-gold-400 text-xs font-medium px-3 py-1"
              >
                {loc}
                <button onClick={() => toggleFilter("locations", loc)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.priceRange !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-400/10 text-brand-gold-400 text-xs font-medium px-3 py-1">
                {PRICE_RANGES[filters.priceRange].label}
                <button onClick={() => setPriceRange(null)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-400/10 text-brand-gold-400 text-xs font-medium px-3 py-1">
                {filters.minPrice && `KES ${Number(filters.minPrice).toLocaleString()}`}
                {filters.minPrice && filters.maxPrice && " - "}
                {filters.maxPrice && `KES ${Number(filters.maxPrice).toLocaleString()}`}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: "",
                      maxPrice: "",
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((vehicle) => (
            <motion.div key={vehicle.id} variants={fadeUp}>
              <Link href={`/vehicles/${vehicle.id}`}>
                <Card className="group h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={
                          vehicle.type === "luxury" ? "premium" : "status"
                        }
                      >
                        {vehicle.type.charAt(0).toUpperCase() +
                          vehicle.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 glass rounded-pill px-2 py-0.5 flex items-center gap-1">
                      <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
                      <span className="text-xs font-medium text-charcoal dark:text-cream">
                        {vehicle.rating}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                        {vehicle.make} {vehicle.model}
                      </h3>
                    </div>
                    <p className="text-sm text-charcoal/50 dark:text-cream/50 mb-3">
                      {vehicle.year} &middot; {vehicle.seats} seats
                    </p>
                    <div className="flex items-center gap-3 text-xs text-charcoal/50 dark:text-cream/50 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {vehicle.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {vehicle.transmission}
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        {vehicle.fuelType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-charcoal/5 dark:border-white/5">
                      <span className="font-heading text-xl font-bold text-brand-gold-400">
                        KES {vehicle.pricePerDay.toLocaleString()}
                        <span className="text-xs font-normal text-charcoal/50 dark:text-cream/50">
                          {" "}/day
                        </span>
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-charcoal/40 dark:text-cream/40 text-lg">
              No vehicles found matching your search.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-brand-gold-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
