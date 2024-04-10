import React from "react";
import "./TestimonialsSection.css";

function TestimonialsSection() {
  // Dummy data for testimonials (replace with actual data)
  const testimonials = [
    {
      id: 1,
      text: "I used Chana's gift company for my corporate Purim gifts! They were delivered super promptly and all of my gifts were loved and appreciated! Everyone said how unique it was and that the presentation was gorgeous! I'll definitely order again 🙏",
      author: "Pamela F.",
    },
    {
      id: 2,
      text: "What I love about Pretty Presents is their creativity and that I’m able to customize my gift packages. It’s easy to place an order and they ship by the next day!",
      author: "Dina H.",
    },
  ];

  return (
    <section className="testimonials-section">
      <h2>What Our Customers Say</h2>
      <div className="testimonials-list">
        {testimonials.map((testimonial) => (
          <div className="testimonial" key={testimonial.id}>
            <p className="testimonial-text">{testimonial.text}</p>
            <p className="testimonial-author">- {testimonial.author}</p>
            <div className="rating">
              {[...Array(5)].map((star, index) => (
                <span key={index} className={index < 3 ? "filled" : ""}>
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestimonialsSection;
