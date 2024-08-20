import React from "react";
import "./Contact.css";

function Contact() {
  return (
    <div  className="contact-page">
      <div className="contact-info">
        <h2>Contact Us</h2>
        <div className="info">
          <p>
            We would love to hear from you. Reach out to us on{" "}
            <a
              href="https://wa.me/+18452698649"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            .
          </p>
          <p>
            Call us directly at: <a href="tel:0534309254">0534309254</a>
          </p>
          <p>
            Follow our journey on Instagram:{" "}
            <a
              href="https://www.instagram.com/prettypresentsbychana"
              target="_blank"
              rel="noopener noreferrer"
            >
              @prettypresentsbychana
            </a>
          </p>
          <p>We look forward to connecting with you.</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
