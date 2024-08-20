import React from "react";
import HeroSection from "./HeroSection";
import FeaturedProducts from "./FeaturedProducts";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";
import CallToAction from "./CallToAction";
import FAQSection from "./FAQSection";

function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CallToAction />
    </>
  );
}

export default LandingPage;
