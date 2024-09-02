import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 T&B Liquid Gold. All rights reserved.</p>
        <p className="holdowsky">Website crafted by Y. Holdowsky.</p>
        <p className="holdowsky">Need a your own website?</p>
        <p className="holdowsky">
          <a href="mailto:jacobedward1995@gmail.com?subject=Saw%20your%20website%20on%20TandBeeLiquidGold.com!">
            Reach out today!{" "}
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
