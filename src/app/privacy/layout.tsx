import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Cruise Car Rental",
  description:
    "Read the Cruise privacy policy. Learn how we collect, use, and protect your personal information on our car rental platform.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
