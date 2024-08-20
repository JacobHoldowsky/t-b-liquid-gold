import React from 'react';
import './TestimonialsSection.css';

function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <h2>What Our Customers Say</h2>
      <div className="testimonials-grid">
        <div className="testimonial">
          <p>
            "The best honey I've ever tasted! Perfect for gifts and personal
            use."
          </p>
          <h3>- Sarah M.</h3>
        </div>
        <div className="testimonial">
          <p>
            "A delightful experience from start to finish. Highly recommend!"
          </p>
          <h3>- David L.</h3>
        </div>
        <div className="testimonial">
          <p>
            "Incredible flavor and quality. I keep coming back for more."
          </p>
          <h3>- Rachel G.</h3>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
