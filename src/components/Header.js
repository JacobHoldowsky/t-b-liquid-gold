import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link"; // Import HashLink
import "./Header.css";

function Header({ cartItemCount }) {
  const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -100; // Adjust this value to match the height of your sticky header
    window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="t&bLiquidGoldLogo.png" alt="TnB Liquid Gold" />
        </Link>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/catalog">Catalog</Link>
          </li>
          <li>
            <HashLink smooth to="/catalog#honeyJars" scroll={scrollWithOffset}>
              Honey Jars
            </HashLink>
          </li>
          <li>
            <HashLink
              smooth
              to="/catalog#giftPackages"
              scroll={scrollWithOffset}
            >
              Gift Packages
            </HashLink>
          </li>
          <li>
            <HashLink
              smooth
              to="/catalog#corporateGifts"
              scroll={scrollWithOffset}
            >
              Corporate Gifts
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/catalog#wholesale" scroll={scrollWithOffset}>
              Wholesale
            </HashLink>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li className="cart-link">
            <Link to="/checkout">
              Checkout
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
