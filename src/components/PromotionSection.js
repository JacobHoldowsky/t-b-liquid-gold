import React from 'react';
import './PromotionSection.css';
import { Link } from 'react-router-dom';

function PromotionSection() {
  return (
    <section className="promotion-section">
      <h2>Special Limited-Time Offer!</h2>
      <p>
        Get 10% off your first order when you subscribe to our newsletter.
        Offer valid for a limited time only.
      </p>
      <Link to="/subscribe" className="promo-btn">
        Subscribe Now
      </Link>
    </section>
  );
}

export default PromotionSection;
