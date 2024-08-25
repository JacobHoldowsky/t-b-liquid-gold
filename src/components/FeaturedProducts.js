import React, { useContext } from "react";
import { HashLink } from "react-router-hash-link"; // Import HashLink
import "./FeaturedProducts.css";
import { CurrencyContext } from "../context/CurrencyContext"; // Import CurrencyContext
import { ExchangeRateContext } from "../context/ExchangeRateContext"; // Import the context

function FeaturedProducts() {
  const { currency } = useContext(CurrencyContext); // Use context here
  const exchangeRate = useContext(ExchangeRateContext); // Use the context here

  const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -100; // Adjust this value to match the height of your sticky header
    window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
  };

  return (
    <section className="featured-products">
      <h2>Our Featured Products</h2>
      <div className="product-grid">
        {/* Gift Packages */}
        <div className="product-card">
          <img src="Deluxe Box $120.jpg" alt="Deluxe Box" />
          <h3>Deluxe Box</h3>
          <p>
            {currency === "Dollar"
              ? "$120"
              : `₪${exchangeRate ? Math.ceil(120 * exchangeRate) : Math.ceil(120 * 3.7)}`}
          </p>
          <HashLink
            smooth
            to="/giftPackages"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Gift Packages
          </HashLink>
        </div>
        {/* Corporate Gifts */}
        <div className="product-card">
          <img src="For Her $55.jpg" alt="For Her" />
          <h3>For Her</h3>
          <p>
            {currency === "Dollar"
              ? "$55"
              : `₪${exchangeRate ? Math.ceil(55 * exchangeRate) : Math.ceil(55 * 3.7)}`}
          </p>
          <HashLink
            smooth
            to="/corporateGifts"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Corporate Gifts
          </HashLink>
        </div>
        <div className="product-card">
          <img src="Collection Plus $95.jpg" alt="Collection Plus" />
          <h3>Collection Plus</h3>
          <p>
            {currency === "Dollar"
              ? "$105"
              : `₪${exchangeRate ? Math.ceil(105 * exchangeRate) : Math.ceil(105 * 3.7)}`}
          </p>
          <HashLink
            smooth
            to="/giftPackages"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Gift Packages
          </HashLink>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
