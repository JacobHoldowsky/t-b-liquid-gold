import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 T&B Liquid Gold. All rights reserved.</p>
        <p className="holdowsky">
          Website developed by{" "}
          <a
            href="https://uxilitypro.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            UXilityPRO
          </a>
          .
        </p>
        <p className="holdowsky">Need your own website?</p>
        <p className="holdowsky">
          <a
            href="https://uxilitypro.com/contact"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reach out today!{" "}
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
