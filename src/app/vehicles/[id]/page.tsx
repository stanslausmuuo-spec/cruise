import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Suspense } from "react";
import { VehicleDetailContent } from "@/components/vehicles/vehicle-detail-content";
import { VehicleDetailSkeleton } from "@/components/vehicles/vehicle-detail-skeleton";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const convex = getConvexClient();
    const vehicle = await convex.query(api.vehicles.getVehicle, { vehicleId: id as Id<"vehicles"> });
    if (!vehicle) return { title: "Vehicle Not Found" };
    return {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model} | Cruise`,
      description: vehicle.description?.slice(0, 160),
    };
  } catch {
    return { title: "Vehicle | Cruise" };
  }
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<VehicleDetailSkeleton />}>
      <VehicleDetailLoader vehicleId={id} />
    </Suspense>
  );
}

async function VehicleDetailLoader({ vehicleId }: { vehicleId: string }) {
  const convex = getConvexClient();
  const vehicle = await convex.query(api.vehicles.getVehicle, {
    vehicleId: vehicleId as Id<"vehicles">,
  });
  if (!vehicle) notFound();

  const owner = await convex.query(api.auth.getPublicUser, {
    userId: vehicle.ownerId,
  });

  return <VehicleDetailContent vehicle={vehicle} owner={owner ?? undefined} />;
}
