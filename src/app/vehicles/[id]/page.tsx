"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { staggerContainer, fadeUp } from "@/lib/animations";
import {
  ArrowLeft, MapPin, Star, Fuel, Settings, Users, Calendar,
  ShieldCheck, Share2, Heart, Phone
} from "lucide-react";

// Mock data — in production this comes from Convex
const vehicle = {
  id: "1",
  make: "Mercedes-Benz",
  model: "E-Class",
  year: 2023,
  type: "luxury",
  transmission: "automatic",
  fuelType: "petrol",
  seats: 5,
  pricePerDay: 8500,
  description: "Experience luxury at its finest with this Mercedes-Benz E-Class. Featuring a premium interior, advanced driver assistance systems, and a smooth, powerful engine. Perfect for business trips, weddings, or a weekend getaway.",
  features: ["Leather Seats", "Sunroof", "Bluetooth", "GPS Navigation", "Climate Control", "Parking Sensors"],
  location: "Nairobi, Kenya",
  rating: 4.9,
  reviewCount: 42,
  images: [
    "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=800&q=80",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=800&q=80",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f7b?w=800&q=80",
  ],
  host: {
    name: "James Mwangi",
    rating: 4.9,
    trips: 128,
    verified: true,
  },
};

export default function VehicleDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to vehicles
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden h-[300px] md:h-[450px]"
            >
              <img
                src={vehicle.images[selectedImage]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="premium" size="md">{vehicle.type}</Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="glass rounded-full p-2 hover:bg-white/80 dark:hover:bg-black/80 transition-colors">
                  <Heart className="h-4 w-4 text-charcoal dark:text-cream" />
                </button>
                <button className="glass rounded-full p-2 hover:bg-white/80 dark:hover:bg-black/80 transition-colors">
                  <Share2 className="h-4 w-4 text-charcoal dark:text-cream" />
                </button>
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
              <motion.div variants={fadeUp}>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
                  {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-charcoal/60 dark:text-cream/60">
                  <span>{vehicle.year}</span>
                  <span className="w-1 h-1 rounded-full bg-charcoal/30 dark:bg-cream/30" />
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vehicle.location}</span>
                  <span className="w-1 h-1 rounded-full bg-charcoal/30 dark:bg-cream/30" />
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-brand-gold-400 fill-brand-gold-400" />{vehicle.rating} ({vehicle.reviewCount} reviews)</span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-6 py-4 border-y border-charcoal/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                  <span className="text-sm capitalize text-charcoal/70 dark:text-cream/70">{vehicle.fuelType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                  <span className="text-sm capitalize text-charcoal/70 dark:text-cream/70">{vehicle.transmission}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-charcoal/50 dark:text-cream/50" />
                  <span className="text-sm text-charcoal/70 dark:text-cream/70">{vehicle.seats} seats</span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-3">Description</h2>
                <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed">{vehicle.description}</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-3">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature) => (
                    <span key={feature} className="glass rounded-pill px-3 py-1.5 text-xs font-medium text-charcoal/70 dark:text-cream/70">
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card glass className="p-6">
                <div className="text-center mb-6">
                  <p className="font-heading text-3xl font-bold text-brand-gold-400">
                    KES {vehicle.pricePerDay.toLocaleString()}
                    <span className="text-sm font-normal text-charcoal/50 dark:text-cream/50"> /day</span>
                  </p>
                </div>

                <Link href={`/vehicles/${vehicle.id}/book`}>
                  <Button className="w-full mb-3" size="lg">
                    <Calendar className="h-4 w-4" />
                    Book Now
                  </Button>
                </Link>

                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="h-4 w-4" />
                  {phoneRevealed ? "+254 712 345 678" : "Reveal Phone — KES 100"}
                </Button>
              </Card>

              <Card glass className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={vehicle.host.name} size="md" verified={vehicle.host.verified} />
                  <div>
                    <p className="font-medium text-sm text-charcoal dark:text-cream">{vehicle.host.name}</p>
                    <div className="flex items-center gap-1 text-xs text-charcoal/50 dark:text-cream/50">
                      <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
                      {vehicle.host.rating} &middot; {vehicle.host.trips} trips
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-brand-gold-400">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Host
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
