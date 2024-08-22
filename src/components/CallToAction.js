import React from 'react';
import './CallToAction.css';
import { Link } from 'react-router-dom';

function CallToAction() {
  return (
    <section className="call-to-action">
      <h2>Ready to Taste the Best Honey on Earth?</h2>
      <Link to="/honeyCollection" className="cta-btn">
        Shop Now
      </Link>
    </section>
  );
}

export default CallToAction;
