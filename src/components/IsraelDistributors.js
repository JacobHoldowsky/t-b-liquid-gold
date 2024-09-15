import React from "react";
import { FaWhatsapp } from "react-icons/fa"; // Import WhatsApp icon from react-icons
import "./IsraelDistributors.css"; // Import the CSS file

function IsraelDistributors() {
  return (
    <div className="israel-distributors">
      <h2 className="page-title">Israel Distributors</h2>

      <div className="israel-distributors-section">
        <h3 className="section-title">
          Pick up your honey at any of our local distributors
        </h3>
        <div className="israel-distributors-grid">
          <div className="israel-distributor-card">
            <h4>Efrat</h4>
            <a
              href="https://wa.me/qr/GOWJ5JWFFQFRE1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Order Now
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>RBS D2</h4>
            <a
              href="https://wa.me/972534309254"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Order Now
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>Mevaseret</h4>
            <a
              href="https://wa.me/qr/L626LCCV47NOL1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Order Now
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>Carmei Gat</h4>
            <a
              href="https://wa.me/972586725613"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Order Now
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>Modiin</h4>
            <a
              href="https://wa.me/972549475747"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Order Now
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>Rechavia</h4>
            <a
              href="https://wa.me/972555576539"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Order Now
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>Jerusalem</h4>
            <a
              href="https://wa.me/message/W7IN5L774FZJJ1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Order Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IsraelDistributors;
