import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 T&B Liquid Gold. All rights reserved.</p>
        <p className="holdowsky">
          Website created by{" "}
          <a
            href="https://uxilitypro.com/contact"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="logo-img"
              src="UXilityPROLogo2.png"
              alt="UXilityPRO Logo"
            />
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
