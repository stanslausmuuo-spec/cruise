"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/hero-section";

const HowItWorks = dynamic(() =>
  import("@/components/landing/how-it-works").then((m) => m.HowItWorks)
);
const FeaturedCars = dynamic(() =>
  import("@/components/landing/featured-cars").then((m) => m.FeaturedCars)
);
const TrustSection = dynamic(() =>
  import("@/components/landing/trust-section").then((m) => m.TrustSection)
);
const CTASection = dynamic(() =>
  import("@/components/landing/cta-section").then((m) => m.CTASection)
);

export default function Home() {
  return (
    <div className="scroll-snap-y h-screen overflow-y-scroll">
      <HeroSection />
      <HowItWorks />
      <FeaturedCars />
      <TrustSection />
      <CTASection />
    </div>
  );
}
