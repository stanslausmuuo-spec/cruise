"use client";

import { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { VEHICLE_TYPES, TRANSMISSION_TYPES, PRICE_RANGES, COUNTIES, VEHICLE_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";

interface FilterState {
  types: string[];
  transmissions: string[];
  counties: string[];
  priceRange: number | null;
  minPrice: string;
  maxPrice: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  activeCount: number;
}

function CountyFilter({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (county: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = query
    ? COUNTIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : COUNTIES;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-3 py-1.5 text-xs text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
      >
        <span>
          {selected.length === 0 ? "All counties" : `${selected.length} selected`}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setQuery(""); }} />
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-glass-border-light dark:border-glass-border-dark bg-white dark:bg-surface-dark-muted shadow-premium p-2 max-h-64 flex flex-col">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-charcoal/40 dark:text-cream/40" />
              <input
                type="text"
                placeholder="Search counties..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent pl-7 pr-3 py-1.5 text-xs text-charcoal dark:text-cream focus:outline-none focus:ring-1 focus:ring-brand-gold-400/50"
              />
            </div>
            <div className="overflow-y-auto flex-1 space-y-0.5">
              {filtered.map((county) => (
                <label
                  key={county}
                  className="flex items-center gap-2 cursor-pointer group rounded-lg px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(county)}
                    onChange={() => onToggle(county)}
                    className="rounded border-charcoal/20 dark:border-white/20 text-brand-gold-400 focus:ring-brand-gold-400/50"
                  />
                  <span className="text-sm text-charcoal/70 dark:text-cream/70 group-hover:text-charcoal dark:group-hover:text-cream transition-colors">
                    {county}
                  </span>
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-charcoal/40 dark:text-cream/40 text-center py-4">
                  No counties found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterPanel({ filters, onChange, onClear, activeCount }: FilterPanelProps) {
  const toggleFilter = (key: "types" | "transmissions" | "counties", value: string) => {
    const arr = filters[key] as string[];
    onChange({
      ...filters,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  const setPriceRange = (index: number | null) => {
    onChange({
      ...filters,
      priceRange: filters.priceRange === index ? null : index,
    });
  };

  return (
    <div className="glass rounded-2xl p-6 border border-glass-border-light dark:border-glass-border-dark">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
          Filters
        </h2>
        {activeCount > 0 && (
          <button
            onClick={onClear}
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
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => toggleFilter("types", type)}
                  className="rounded border-charcoal/20 dark:border-white/20 text-brand-gold-400 focus:ring-brand-gold-400/50"
                />
                <span className="text-sm text-charcoal/70 dark:text-cream/70 group-hover:text-charcoal dark:group-hover:text-cream transition-colors">
                  {VEHICLE_TYPE_LABELS[type] || type}
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
              <label key={t} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.transmissions.includes(t)}
                  onChange={() => toggleFilter("transmissions", t)}
                  className="rounded border-charcoal/20 dark:border-white/20 text-brand-gold-400 focus:ring-brand-gold-400/50"
                />
                <span className="text-sm text-charcoal/70 dark:text-cream/70 group-hover:text-charcoal dark:group-hover:text-cream transition-colors">
                  {TRANSMISSION_LABELS[t] || t}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60 uppercase tracking-wide mb-3">
            County
          </p>
          <CountyFilter
            selected={filters.counties}
            onToggle={(c) => toggleFilter("counties", c)}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60 uppercase tracking-wide mb-3">
            Price Range
          </p>
          <div className="space-y-2 mb-3">
            {PRICE_RANGES.map((range, i) => (
              <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
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
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value, priceRange: null })}
              className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-3 py-1.5 text-xs text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
            />
            <span className="text-xs text-charcoal/40 dark:text-cream/40">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value, priceRange: null })}
              className="w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-3 py-1.5 text-xs text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { FilterPanel, CountyFilter };
export type { FilterState };
