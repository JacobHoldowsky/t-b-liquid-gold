import React from "react";
import "./Footer.css"; // Import CSS for styling

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} T&B Liquid Gold. All rights
          reserved.
        </p>

        <p className="holdowsky">
          Website built and maintained by{" "}
          <a
            href="https://www.linkedin.com/uxilitypro"
            target="_blank"
            rel="noopener noreferrer"
          >
            UXilityPRO
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

export default Footer;
