"use client";

import { X } from "lucide-react";
import { VEHICLE_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";

interface ActiveFilterTagsProps {
  types: string[];
  transmissions: string[];
  counties: string[];
  priceRange: number | null;
  priceRanges: readonly { label: string; min: number; max: number }[];
  minPrice?: string;
  maxPrice?: string;
  onRemoveType: (type: string) => void;
  onRemoveTransmission: (transmission: string) => void;
  onRemoveCounty: (county: string) => void;
  onRemovePriceRange: () => void;
  onRemoveCustomPrice: () => void;
}

function ActiveFilterTags({
  types,
  transmissions,
  counties,
  priceRange,
  priceRanges,
  minPrice,
  maxPrice,
  onRemoveType,
  onRemoveTransmission,
  onRemoveCounty,
  onRemovePriceRange,
  onRemoveCustomPrice,
}: ActiveFilterTagsProps) {
  const hasFilters = types.length > 0 || transmissions.length > 0 || counties.length > 0 || priceRange !== null || minPrice || maxPrice;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {types.map((t) => (
        <FilterTag key={t} label={VEHICLE_TYPE_LABELS[t] || t} onRemove={() => onRemoveType(t)} />
      ))}
      {transmissions.map((t) => (
        <FilterTag key={t} label={TRANSMISSION_LABELS[t] || t} onRemove={() => onRemoveTransmission(t)} />
      ))}
      {counties.map((c) => (
        <FilterTag key={c} label={c} onRemove={() => onRemoveCounty(c)} />
      ))}
      {priceRange !== null && priceRanges[priceRange] && (
        <FilterTag label={priceRanges[priceRange].label} onRemove={onRemovePriceRange} />
      )}
      {(minPrice || maxPrice) && (
        <FilterTag
          label={`${minPrice ? `KES ${Number(minPrice).toLocaleString()}` : ""}${minPrice && maxPrice ? " - " : ""}${maxPrice ? `KES ${Number(maxPrice).toLocaleString()}` : ""}`}
          onRemove={onRemoveCustomPrice}
        />
      )}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-400/10 text-brand-gold-400 text-xs font-medium px-3 py-1">
      {label}
      <button onClick={onRemove}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export { ActiveFilterTags };
