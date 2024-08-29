import React from "react";
import { FaWhatsapp } from "react-icons/fa"; // Import WhatsApp icon from react-icons
import "./USDistributors.css"; // Import the CSS file

function USDistributors() {
  return (
    <div className="us-distributors">
      <h2 className="page-title">US Distributors</h2>

      <div className="distributors-section">
        <h3 className="section-title">Distributors</h3>
        <div className="distributors-grid">
          <div className="distributor-card">
            <h4>Monsey</h4>
            <a
              href="https://wa.me/13475633508"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Devora Bracha Sommer
            </a>
          </div>
          <div className="distributor-card">
            <h4>Haverstraw</h4>
            <a
              href="https://wa.me/qr/3KPZUWAGUXV2C1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Shira Heinemann
            </a>
          </div>
          <div className="distributor-card">
            <h4>Five Towns</h4>
            <a
              href="https://wa.me/message/AUHFRK2KKV27O1"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Chana Tokarsky
            </a>
          </div>
          <div className="distributor-card">
            <h4>Lakewood</h4>
            <a
              href="https://wa.me/18485250358"
              className="whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon" />
              Rochel Hershberg
            </a>
          </div>
        </div>
      </div>

      <div className="stores-section">
        <h3 className="section-title">Stores</h3>
        <ul className="stores-list">
          <li>The Kitchen Clique, Brooklyn NY and Lakewood NJ</li>
          <li>The Cheese Store, Five Towns, NY</li>
        </ul>
      </div>

      <div className="nationwide-section">
        <div className="distributor-card">
          <h4>For Nationwide Shipping Please Contact</h4>
          <a
            href="https://wa.me/message/AUHFRK2KKV27O1"
            className="whatsapp-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp className="whatsapp-icon" />
            Chana Tokarsky
          </a>
        </div>
      </div>
    </div>
  );
}

export default USDistributors;
