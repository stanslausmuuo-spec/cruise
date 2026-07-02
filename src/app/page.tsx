"use client";

import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedCars } from "@/components/landing/featured-cars";
import { TrustSection } from "@/components/landing/trust-section";
import { CTASection } from "@/components/landing/cta-section";

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
