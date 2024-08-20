import React from 'react';
import './FAQSection.css';

function FAQSection() {
  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-grid">
        <div className="faq-item">
          <h3>What is creamed honey?</h3>
          <p>
            Creamed honey is honey that has been processed to control
            crystallization, giving it a smooth and spreadable texture.
          </p>
        </div>
        <div className="faq-item">
          <h3>How should I store my honey?</h3>
          <p>
            Store your honey in a cool, dry place away from direct sunlight. No
            need to refrigerate.
          </p>
        </div>
        <div className="faq-item">
          <h3>Do you offer international shipping?</h3>
          <p>Yes, we ship our products worldwide.</p>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
