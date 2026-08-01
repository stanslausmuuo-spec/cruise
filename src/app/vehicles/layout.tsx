import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Vehicles — CruiseLinx Car Rental",
  description:
    "Browse verified vehicles available for rent on CruiseLinx. Filter by make, model, price, and location to find the perfect car for your trip.",
};

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
