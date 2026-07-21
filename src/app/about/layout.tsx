import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Cruise Car Rental",
  description:
    "Learn about Cruise, the premium peer-to-peer car rental marketplace connecting vehicle owners with renters for a seamless driving experience.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
