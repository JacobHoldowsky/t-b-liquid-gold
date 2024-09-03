import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 T&B Liquid Gold. All rights reserved.</p>
        <p className="holdowsky">Website developed by Y. Holdowsky.</p>
        <p className="holdowsky">Need your own website?</p>
        <p className="holdowsky">
          <a href="mailto:jacobedward1995@gmail.com?subject=Reaching%20out%20from%20TandBeeLiquidGold.com!">
            Reach out today!{" "}
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
