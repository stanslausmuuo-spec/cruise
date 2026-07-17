"use client";

interface VehicleFeaturesProps {
  features: string[];
}

function VehicleFeatures({ features }: VehicleFeaturesProps) {
  if (!features || features.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-3">
        Features
      </h2>
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <span
            key={feature}
            className="glass rounded-pill px-3 py-1.5 text-xs font-medium text-charcoal/70 dark:text-cream/70"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}

export { VehicleFeatures };
