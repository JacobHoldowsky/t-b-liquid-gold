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
            href="https://uxilitypro.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="logo-img"
              src="UXilityPROLogoBest.svg"
              alt="UXilityPRO Logo"
            />
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
