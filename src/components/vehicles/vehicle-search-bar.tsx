"use client";

import { Search } from "lucide-react";

interface VehicleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function VehicleSearchBar({ value, onChange, placeholder = "Search make or model..." }: VehicleSearchBarProps) {
  return (
    <div className="relative flex-1 md:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 dark:text-cream/40" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-pill glass border border-glass-border-light dark:border-glass-border-dark pl-10 pr-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
      />
    </div>
  );
}

export { VehicleSearchBar };
