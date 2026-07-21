"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FeaturedCars() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  const result = useQuery(api.vehicles.listVehicles, { limit: 4 });
  const vehicles = result?.vehicles ?? [];

  if (vehicles.length === 0) return null;

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
          {vehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="min-w-[320px] md:min-w-[380px]"
            >
              <VehicleCard vehicle={vehicle} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
