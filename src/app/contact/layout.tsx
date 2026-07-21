import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Cruise Car Rental",
  description:
    "Get in touch with the Cruise team. We're here to help with bookings, account issues, and any questions about our car rental marketplace.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
