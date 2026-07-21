import { SkeletonScreen } from "@/components/ui/skeleton";

function VehicleDetailSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <SkeletonScreen type="detail" />
    </div>
  );
}

export { VehicleDetailSkeleton };
