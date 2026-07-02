"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const featuredVehicles = [
  {
    id: "1",
    make: "Mercedes-Benz",
    model: "E-Class",
    year: 2023,
    type: "luxury" as const,
    pricePerDay: 8500,
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=600&q=80",
    rating: 4.9,
  },
  {
    id: "2",
    make: "Range Rover",
    model: "Velar",
    year: 2024,
    type: "suv" as const,
    pricePerDay: 12000,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
    rating: 4.8,
  },
  {
    id: "3",
    make: "BMW",
    model: "7 Series",
    year: 2024,
    type: "luxury" as const,
    pricePerDay: 15000,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
    rating: 4.9,
  },
  {
    id: "4",
    make: "Porsche",
    model: "Cayenne",
    year: 2023,
    type: "suv" as const,
    pricePerDay: 18000,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    rating: 5.0,
  },
];

export function FeaturedCars() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={containerRef} className="min-h-screen snap-start flex items-center py-20 overflow-hidden">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 mb-12"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-brand-gold-400 font-medium text-sm tracking-widest uppercase mb-3">
                Premium Selection
              </p>
              <h2 className="text-charcoal dark:text-cream">
                Featured <span className="text-gradient-gold">Fleet</span>
              </h2>
            </div>
            <Link href="/vehicles">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div style={{ x }} className="flex gap-6 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {featuredVehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="min-w-[320px] md:min-w-[380px]"
            >
              <Link href={`/vehicles/${vehicle.id}`}>
                <Card className="group overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="featured">Featured</Badge>
                    </div>
                    <div className="absolute top-3 right-3 glass rounded-pill px-2.5 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
                      <span className="text-xs font-medium text-charcoal dark:text-cream">
                        {vehicle.rating}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-charcoal/50 dark:text-cream/50">
                          {vehicle.year} &middot; {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-charcoal/5 dark:border-white/5">
                      <span className="font-heading text-xl font-bold text-brand-gold-400">
                        KES {vehicle.pricePerDay.toLocaleString()}
                        <span className="text-xs font-normal text-charcoal/50 dark:text-cream/50"> /day</span>
                      </span>
                      <span className="text-xs text-charcoal/40 dark:text-cream/40 hover:text-brand-gold-400 transition-colors">
                        Book Now →
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
