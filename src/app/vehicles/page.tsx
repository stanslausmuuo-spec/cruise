"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Search, SlidersHorizontal, Star, MapPin } from "lucide-react";
import Link from "next/link";

const vehicles = [
  { id: "1", make: "Mercedes-Benz", model: "E-Class", year: 2023, type: "luxury", pricePerDay: 8500, image: "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=600&q=80", rating: 4.9, location: "Nairobi", transmission: "automatic" },
  { id: "2", make: "Range Rover", model: "Velar", year: 2024, type: "suv", pricePerDay: 12000, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80", rating: 4.8, location: "Nairobi", transmission: "automatic" },
  { id: "3", make: "BMW", model: "7 Series", year: 2024, type: "luxury", pricePerDay: 15000, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80", rating: 4.9, location: "Mombasa", transmission: "automatic" },
  { id: "4", make: "Porsche", model: "Cayenne", year: 2023, type: "suv", pricePerDay: 18000, image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", rating: 5.0, location: "Nairobi", transmission: "automatic" },
  { id: "5", make: "Toyota", model: "Land Cruiser", year: 2023, type: "suv", pricePerDay: 9500, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58d7?w=600&q=80", rating: 4.7, location: "Nairobi", transmission: "automatic" },
  { id: "6", make: "Lexus", model: "LS 500", year: 2024, type: "luxury", pricePerDay: 16000, image: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=600&q=80", rating: 4.9, location: "Nairobi", transmission: "automatic" },
];

export default function VehiclesPage() {
  const [search, setSearch] = useState("");

  const filtered = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
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
              {filtered.length} vehicles available
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
            <Button variant="outline" size="sm" icon={<SlidersHorizontal className="h-4 w-4" />}>
              Filters
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((vehicle, i) => (
            <motion.div key={vehicle.id} variants={fadeUp}>
              <Link href={`/vehicles/${vehicle.id}`}>
                <Card className="group h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={vehicle.type === "luxury" ? "premium" : "status"}>
                        {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 glass rounded-pill px-2 py-0.5 flex items-center gap-1">
                      <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
                      <span className="text-xs font-medium text-charcoal dark:text-cream">{vehicle.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                        {vehicle.make} {vehicle.model}
                      </h3>
                    </div>
                    <p className="text-sm text-charcoal/50 dark:text-cream/50 mb-3">
                      {vehicle.year} &middot; {vehicle.transmission}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-charcoal/50 dark:text-cream/50 mb-3">
                      <MapPin className="h-3 w-3" />
                      {vehicle.location}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-charcoal/5 dark:border-white/5">
                      <span className="font-heading text-xl font-bold text-brand-gold-400">
                        KES {vehicle.pricePerDay.toLocaleString()}
                        <span className="text-xs font-normal text-charcoal/50 dark:text-cream/50"> /day</span>
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
            <p className="text-charcoal/40 dark:text-cream/40 text-lg">No vehicles found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
