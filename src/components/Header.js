import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { CurrencyContext } from "../context/CurrencyContext";
import { useShopContext } from "../context/ShopContext";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faShekelSign,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../components/Modal";

function Header({ cart, cartItemCount, clearCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [cartIndicatorAnimated, setCartIndicatorAnimated] = useState(false);
  const { currency, toggleCurrency } = useContext(CurrencyContext);
  const { shopRegion, toggleShopRegion } = useShopContext();
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // New states for drag and slider position
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const handleCurrencyToggle = () => {
    toggleCurrency(currency === "Dollar" ? "Shekel" : "Dollar");
  };

  const handleShopRegionSelect = (region) => {
    if (cartItemCount > 0) {
      setShowWarning(true);
    } else {
      if (
        (region === "US" && shopRegion !== "US") ||
        (region === "Israel" && shopRegion === "US")
      ) {
        toggleShopRegion();
      }
    }
  };

  const handleShopRegionChange = () => {
    if (cartItemCount > 0) {
      setShowWarning(true);
    } else {
      toggleShopRegion();
    }
  };

  const confirmRegionChange = () => {
    setShowWarning(false);
    clearCart();
    toggleShopRegion();
  };

  const cancelRegionChange = () => {
    setShowWarning(false);
  };

  // New handlers for dragging the slider
  const handleMouseDown = (event) => {
    setIsDragging(true);
    event.preventDefault();
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const sliderOffset = sliderRef.current.getBoundingClientRect().left;
      const mouseX = event.clientX - sliderOffset;

      if (mouseX > sliderWidth / 2 && shopRegion !== "US") {
        handleShopRegionSelect("US");
      } else if (mouseX <= sliderWidth / 2 && shopRegion === "US") {
        handleShopRegionSelect("Israel");
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseOut = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (event) => {
    setIsDragging(true);
    event.preventDefault();
  };

  console.log(isDragging);

  const handleTouchMove = (event) => {
    if (isDragging) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const sliderOffset = sliderRef.current.getBoundingClientRect().left;
      const touchX = event.touches[0].clientX - sliderOffset;

      if (touchX > sliderWidth / 2 && shopRegion !== "US") {
        handleShopRegionSelect("US");
      } else if (touchX <= sliderWidth / 2 && shopRegion === "US") {
        handleShopRegionSelect("Israel");
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [headerRef]);

  useEffect(() => {
    if (cartItemCount > 0) {
      setCartIndicatorAnimated(true);
      const timeout = setTimeout(() => setCartIndicatorAnimated(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [cartItemCount]);

  useEffect(() => {
    if (
      shopRegion === "US" &&
      (location.pathname === "/wholesale" ||
        location.pathname === "/corporateGifts")
    ) {
      setShowRedirectModal(true);
    }
  }, [shopRegion, location.pathname]);

  const handleRedirectConfirm = () => {
    setShowRedirectModal(false);
    navigate("/");
  };

  const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -100;
    window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <header className="header" ref={headerRef}>
      <div className="logo-currency-wrapper">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <img src="/tnbLiquidGoldLogo-min.png" alt="TnB Liquid Gold" />
          </Link>
        </div>
        <div className="currency-toggle" onClick={handleCurrencyToggle}>
          <FontAwesomeIcon
            icon={currency === "Dollar" ? faDollarSign : faShekelSign}
          />
        </div>
        {/* Enhanced Toggle Slider for Shop Region */}
        <div className="shop-toggle-slider" ref={sliderRef}>
          <span
            className="slider-label"
            onClick={() => handleShopRegionSelect("Israel")}
          >
            Shop Israel
          </span>
          <label
            className="switch"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseOut={handleMouseOut}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouch={handleTouchEnd}
          >
            <input
              type="checkbox"
              checked={shopRegion === "US"}
              onChange={handleShopRegionChange}
            />
            <span className="slider round"></span>
          </label>
          <span
            className="slider-label"
            onClick={() => handleShopRegionSelect("US")}
          >
            Shop USA
          </span>
        </div>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
        {cartItemCount > 0 && ( // Cart indicator for small screens
          <span
            className={`cart-indicator ${
              cartIndicatorAnimated ? "animate" : ""
            }`}
          >
            {cartItemCount}
          </span>
        )}
      </div>

      <nav>
        <ul className={isOpen ? "active" : ""}>
          <li
            className={`dropdown ${activeDropdown === "shop" ? "active" : ""}`}
            onClick={() => toggleDropdown("shop")}
          >
            <Link className="top-level-header-item">Shop</Link>
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
              {shopRegion !== "US" ? (
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
              ) : null}
              {shopRegion !== "US" ? (
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
              ) : null}

              <li>
                <HashLink
                  className="dropdown-menu-item"
                  smooth
                  to="/sponsorAHoneyBoard"
                  scroll={scrollWithOffset}
                  onClick={closeMenu}
                >
                  Sponsor a Honey Board
                </HashLink>
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
          <li
            className={`dropdown ${
              activeDropdown === "distributors" ? "active" : ""
            }`}
            onClick={() => toggleDropdown("distributors")}
          >
            <Link className="top-level-header-item">Distributors</Link>
            <ul className="dropdown-menu">
              <li>
                <Link
                  className="dropdown-menu-item"
                  to="/distributors/us"
                  onClick={closeMenu}
                >
                  US Distributors
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-menu-item"
                  to="/distributors/israel"
                  onClick={closeMenu}
                >
                  Israel Distributors
                </Link>
              </li>
            </ul>
          </li>
          <li className="cart-link">
            <Link
              className="top-level-header-item"
              to="/checkout"
              onClick={closeMenu}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Modal for confirming region change */}
      <Modal
        isOpen={showWarning}
        title="Change Shop Region"
        message="Changing the shop region will empty your cart. Do you want to proceed?"
        onConfirm={confirmRegionChange}
        onCancel={cancelRegionChange}
      />

      {/* Modal for redirecting to home page */}
      <Modal
        isOpen={showRedirectModal}
        title="Page Not Available"
        message="This page is not available for US shipping. You will be redirected to the homepage."
        onConfirm={handleRedirectConfirm} // Redirect when the user clicks OK
        noOptions={true}
      />
    </header>
  );
}

export default Header;
