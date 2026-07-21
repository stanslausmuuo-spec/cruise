import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Cruise Car Rental",
  description:
    "Discover how easy it is to rent a car on Cruise. From browsing vehicles to booking and driving, here's the step-by-step process.",
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
