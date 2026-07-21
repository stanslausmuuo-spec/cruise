"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { format } from "date-fns";

export function HeroSearchBar() {
  const router = useRouter();
  const [pickupLocation, setPickupLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(2);

  // Default to tomorrow and day after tomorrow
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupLocation) params.set("location", pickupLocation);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (guests) params.set("guests", guests.toString());

    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-4 md:p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-charcoal/50 dark:text-cream/50 mb-1.5">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40 dark:text-cream/40" />
                <Input
                  placeholder="Where to? (e.g. Nairobi CBD, Westlands, Airport)"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark-muted border border-charcoal/10 dark:border-white/10 rounded-xl text-sm text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/50 dark:text-cream/50 mb-1.5">
              Pickup Date
            </label>
            <Input
              type="date"
              value={startDate || format(defaultStart, "yyyy-MM-dd")}
              onChange={(e) => setStartDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              className="bg-white dark:bg-surface-dark-muted border border-charcoal/10 dark:border-white/10 rounded-xl text-sm text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 py-3.5"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/50 dark:text-cream/50 mb-1.5">
              Return Date
            </label>
            <Input
              type="date"
              value={endDate || format(defaultEnd, "yyyy-MM-dd")}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || format(defaultStart, "yyyy-MM-dd")}
              className="bg-white dark:bg-surface-dark-muted border border-charcoal/10 dark:border-white/10 rounded-xl text-sm text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 py-3.5"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/50 dark:text-cream/50 mb-1.5">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-white dark:bg-surface-dark-muted border border-charcoal/10 dark:border-white/10 rounded-xl text-sm text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 py-3.5 px-4 appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} Guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </form>
    );
}