import React from "react";
import "./TestimonialsSection.css";

function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <h2>What Our Customers Say</h2>
      <div className="testimonials-grid">
        <div className="testimonial">
          <p>
            "The most amazing honey I've ever tasted. Also they have the best
            customer service."
          </p>
          <h3>- Tamar Gold</h3>
        </div>
        <div className="testimonial">
          <p>
            "This was a perfect way to gift our company employees. They all loved
            it."
          </p>
          <h3>- Natan Ben Chaim</h3>
        </div>
        <div className="testimonial">
          <p>
            "We tasted this by our friends and decided that we needed to buy it
            for ourselves for Rosh Hashana. It was incredible!"
          </p>
          <h3>- Temima Hershkowitz</h3>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
