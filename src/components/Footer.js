import React from "react";
import "./Footer.css"; // Import CSS for styling

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} Pretty Presents by Chana. All rights
          reserved.
        </p>

        <p className="holdowsky">
          Website built and maintained by{" "}
          <a
            href="https://www.linkedin.com/in/jacob-holdowsky-2b0baa103"
            target="_blank"
            rel="noopener noreferrer"
          >
            Holdowsky Web Solutions
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

export default Footer;
