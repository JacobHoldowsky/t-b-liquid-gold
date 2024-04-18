// Contact.js

import React from "react";
import "./Contact.css";

function Contact() {
  return (
    <div className="contact-info">
      <h2>Contact</h2>
      <div className="info">
        <p>
          Let's connect on{" "}
          <a
            href="https://wa.me/+18452698649"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          !
        </p>
        <p>
          Phone: <a href="tel:8452698649">845-269-8649</a>
        </p>
        <p>
          Instagram:{" "}
          <a
            href="https://www.instagram.com/prettypresentsbychana"
            target="_blank"
            rel="noopener noreferrer"
          >
            @prettypresentsbychana
          </a>
        </p>
        <p>We look forward to hearing from you!</p>
      </div>
    </div>
  );
}

export default Contact;
