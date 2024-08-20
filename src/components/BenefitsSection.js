import React from "react";
import "./BenefitsSection.css";

function BenefitsSection() {
  return (
    <section className="benefits-section">
      <h2>Why Choose Us?</h2>
      <div className="benefits-grid">
        <div className="benefit">
          <i className="fas fa-leaf"></i>
          <h3>Organic Ingredients</h3>
          <p>Our honey is made from 100% organic and natural ingredients.</p>
        </div>
        <div className="benefit">
          <i className="fas fa-hand-holding-heart"></i>
          <h3>Handcrafted</h3>
          <p>Each jar is crafted with care in Israel.</p>
        </div>
        <div className="benefit">
          <i className="fas fa-globe"></i>
          <h3>Worldwide Shipping</h3>
          <p>We deliver our premium honey to customers around the globe.</p>
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
