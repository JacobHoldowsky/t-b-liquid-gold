import React from "react";
import { FaWhatsapp } from "react-icons/fa"; // Import WhatsApp icon from react-icons
import "./IsraelDistributors.css"; // Import the CSS file

function IsraelDistributors() {
  return (
    <div className="israel-distributors">
      <h2 className="page-title">Israel Distributors</h2>

      <div className="israel-distributors-section">
        <h3 className="section-title">Distributors</h3>
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
              Rivky Krest
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>RBS D2</h4>
            <a
              href="https://wa.me/message/W7IN5L774FZJJ1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Chaya Kamenetsky
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
              Tehilla Siman Tov
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>Carmei Gat</h4>
            <a
              href="https://wa.me/message/W7IN5L774FZJJ1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Jordana Cohen
            </a>
          </div>
          <div className="israel-distributor-card">
            <h4>Modiin</h4>
            <a
              href="https://wa.me/message/W7IN5L774FZJJ1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Heather Zomer
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
              Batya Sommer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IsraelDistributors;
