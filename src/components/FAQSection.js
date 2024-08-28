import React from "react";
import "./FAQSection.css";

function FAQSection() {
  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-grid">
        <div className="faq-item">
          <h3>What's the Hechsher?</h3>
          <p>
            We are under the strict supervision of Rabbi Weiner of ZNT Kosher.
          </p>
          <img className="hechsher" src="hechsher 5.png" alt="hechsher" />
        </div>
        <div className="faq-item">
          <h3>How do I store my honey?</h3>
          <p>
            Store in a cool/room temperature place for up to 1 year.
            Refrigeration is not needed.
          </p>
        </div>
        <div className="faq-item">
          <h3>What are the delivery details?</h3>
          <p>
            We deliver anywhere in Israel and the US. Delivery rates vary based
            on location.
          </p>
        </div>
        <div className="faq-item">
          <h3>What's the allergy info?</h3>
          <p>
            All of our honey flavors are dairy-free, gluten-free, and nut-free.
            Made in the same facility as nuts, dairy, and gluten.
          </p>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
