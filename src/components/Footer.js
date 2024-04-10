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
      </div>
    </footer>
  );
}

export default Footer;
