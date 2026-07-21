"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/hero-section";

const FeaturedFleet = dynamic(() =>
  import("@/components/landing/featured-cars").then((m) => m.FeaturedCars)
);
const HowItWorks = dynamic(() =>
  import("@/components/landing/how-it-works").then((m) => m.HowItWorks)
);
const TrustSection = dynamic(() =>
  import("@/components/landing/trust-section").then((m) => m.TrustSection)
);
const CTASection = dynamic(() =>
  import("@/components/landing/cta-section").then((m) => m.CTASection)
);

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedFleet />
      <HowItWorks />
      <TrustSection />
      <CTASection />
    </div>
  );
}
