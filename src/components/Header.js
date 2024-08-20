import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link"; 
import "./Header.css";

function Header({ cartItemCount }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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
            <Link to="/" onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <HashLink smooth to="/catalog#ourCollection" scroll={scrollWithOffset} onClick={closeMenu}>
              Our Collection
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/catalog#giftPackages" scroll={scrollWithOffset} onClick={closeMenu}>
              Gift Packages
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/catalog#corporateGifts" scroll={scrollWithOffset} onClick={closeMenu}>
              Corporate Gifts
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/catalog#wholesale" scroll={scrollWithOffset} onClick={closeMenu}>
              Wholesale
            </HashLink>
          </li>
          <li>
            <Link to="/about" onClick={closeMenu}>About</Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
          </li>
          <li className="cart-link">
            <Link to="/checkout" onClick={closeMenu}>
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
