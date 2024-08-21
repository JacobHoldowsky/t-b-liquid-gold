import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { CurrencyContext } from "../context/CurrencyContext";
import "./Header.css";

function Header({ cartItemCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, toggleCurrency } = useContext(CurrencyContext); // Use context here

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleCurrencyChange = (selectedCurrency) => {
    toggleCurrency(selectedCurrency);
    closeMenu();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        closeMenu();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -100;
    window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" onClick={closeMenu}>
          <img src="t&bLiquidGoldLogo.png" alt="TnB Liquid Gold" />
        </Link>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <nav>
        <ul className={isOpen ? "active" : ""}>
          <li>
            <Link className="top-level-header-item" to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="dropdown">
            <Link className="top-level-header-item" onClick={closeMenu}>
              Shop
            </Link>
            <ul className="dropdown-menu">
              <li>
                <HashLink
                  className="dropdown-menu-item"
                  smooth
                  to="/honeyCollection"
                  scroll={scrollWithOffset}
                  onClick={closeMenu}
                >
                  Honey Collection
                </HashLink>
              </li>
              <li>
                <HashLink
                  className="dropdown-menu-item"
                  smooth
                  to="/giftPackages"
                  scroll={scrollWithOffset}
                  onClick={closeMenu}
                >
                  Gift Packages
                </HashLink>
              </li>
              <li>
                <HashLink
                  className="dropdown-menu-item"
                  smooth
                  to="/corporateGifts"
                  scroll={scrollWithOffset}
                  onClick={closeMenu}
                >
                  Corporate Gifts
                </HashLink>
              </li>
              <li>
                <HashLink
                  className="dropdown-menu-item"
                  smooth
                  to="/wholesale"
                  scroll={scrollWithOffset}
                  onClick={closeMenu}
                >
                  Wholesale
                </HashLink>
              </li>
              <li>
                <HashLink
                  className="dropdown-menu-item"
                  smooth
                  to="/sponsorABox"
                  scroll={scrollWithOffset}
                  onClick={closeMenu}
                >
                  Sponsor-a-Box
                </HashLink>
              </li>
            </ul>
          </li>
          <li className="currency-dropdown">
            <span className="currency-toggle">Currency: {currency}</span>
            <ul className="currency-dropdown-menu">
              <li
                className="currency-option"
                onClick={() => handleCurrencyChange("Dollar")}
              >
                Dollar
              </li>
              <li
                className="currency-option"
                onClick={() => handleCurrencyChange("Shekel")}
              >
                Shekel
              </li>
            </ul>
          </li>
          <li>
            <Link
              className="top-level-header-item"
              to="/about"
              onClick={closeMenu}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              className="top-level-header-item"
              to="/contact"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>
          <li className="cart-link">
            <Link
              className="top-level-header-item"
              to="/checkout"
              onClick={closeMenu}
            >
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
