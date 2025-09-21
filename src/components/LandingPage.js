import HeroSection from "./HeroSection";
import FeaturedProducts from "./FeaturedProducts";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";
import CallToAction from "./CallToAction";
import FAQSection from "./FAQSection";
import UsDoneNow from "./usDoneNow";

function LandingPage() {
  return (
    <>
      <HeroSection />
      <UsDoneNow />
      <FeaturedProducts />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CallToAction />
    </>
  );
}

export default LandingPage;
