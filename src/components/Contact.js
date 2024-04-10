// Contact.js

import React from "react";
import "./Contact.css";

function Contact() {
  return (
    <div className="contact-info">
      <h2>Contact</h2>
      <div className="info">
        <p>Phone and WhatsApp: 845-269-8649</p>
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
