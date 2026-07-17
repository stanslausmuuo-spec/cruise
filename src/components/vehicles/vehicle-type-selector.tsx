"use client";

import { VEHICLE_TYPES, VEHICLE_TYPE_LABELS } from "@/lib/constants";
import type { VehicleType } from "@/lib/types";

interface VehicleTypeSelectorProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
}

function VehicleTypeSelector({ value, onChange }: VehicleTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5">
        Type
      </label>
      <div className="flex flex-wrap gap-2">
        {VEHICLE_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`px-4 py-2 rounded-pill text-sm transition-all ${
              value === t
                ? "bg-brand-gold-400 text-white"
                : "glass hover:border-brand-gold-400/30"
            }`}
          >
            {VEHICLE_TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>
    </div>
  );
}

export { VehicleTypeSelector };
