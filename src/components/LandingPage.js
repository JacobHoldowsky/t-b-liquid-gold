import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import FeaturedProducts from "./FeaturedProducts";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";
import CallToAction from "./CallToAction";
import FAQSection from "./FAQSection";

function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <img
              src={`${process.env.PUBLIC_URL}/purimAd.png`}
              alt="Purim Advertisement"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/purim')}
            />
            <button
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer'
              }}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
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
