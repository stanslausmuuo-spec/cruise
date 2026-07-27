"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star, Users, ArrowRight, MapPin } from "lucide-react";

const stats = [
  { icon: ShieldCheck, value: "100%", label: "Verified Hosts" },
  { icon: Star, value: "4.9", label: "Average Rating" },
  { icon: Users, value: "5K+", label: "Happy Drivers" },
];

export function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
          alt="Luxury car"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-brand-gold-400 font-medium text-sm tracking-widest uppercase mb-4"
            >
              Premium P2P Car Rental
            </motion.p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
              Drive the Car
              <br />
              <span className="text-gradient-gold">of Your Dreams</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-white/70 max-w-lg mb-10 leading-relaxed"
            >
              Browse verified luxury vehicles from trusted owners. Book instantly with M-Pesa and hit the road.
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 mb-12"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <MapPin className="h-5 w-5 text-brand-gold-400 shrink-0" />
              <input
                type="text"
                placeholder="Nairobi, Mombasa, Kisumu..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-white/40 text-sm focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg" className="shrink-0">
              Find Cars
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.form>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-wrap gap-6 sm:gap-10"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-brand-gold-400" />
                </div>
                <div>
                  <p className="text-xl font-heading font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
