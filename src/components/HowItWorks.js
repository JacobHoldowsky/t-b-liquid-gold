import React from 'react';
import './HowItWorks.css';

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="steps-grid">
        <div className="step">
          <i className="fas fa-search"></i>
          <h3>Discover</h3>
          <p>Browse our collection of premium flavored honeys.</p>
        </div>
        <div className="step">
          <i className="fas fa-cart-plus"></i>
          <h3>Select</h3>
          <p>Choose your favorite products and add them to your cart.</p>
        </div>
        <div className="step">
          <i className="fas fa-shipping-fast"></i>
          <h3>Receive</h3>
          <p>Enjoy fast and reliable delivery to your doorstep.</p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
