import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./FloatingWhatsAppButton.css";

function FloatingWhatsAppButton() {
  return (
    <div className="floating-whatsapp-button">
      <a
        href="https://wa.me/+972534309254"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-button"
      >
        <i className="fa-brands fa-whatsapp" /> WhatsApp Us
      </a>
    </div>
  );
}

export default FloatingWhatsAppButton;
