import React from "react";
import { HashLink } from "react-router-hash-link"; // Import HashLink
import "./FeaturedProducts.css";

function FeaturedProducts() {
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
          <img src="Honey Collection.png" alt="Deluxe Box" />
          <HashLink
            smooth
            to="/honeyCollection"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Honey Collection
          </HashLink>
        </div>
        {/* Corporate Gifts */}
        <div className="product-card">
          <img src="gift packages.jpg" alt="For Her" />
          <HashLink
            smooth
            to="/giftPackages"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Gift Packages
          </HashLink>
        </div>
        <div className="product-card">
          <img src="Corporate Gifts.png" alt="Collection Plus" />

          <HashLink
            smooth
            to="/corporateGifts"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Corporate Gifts
          </HashLink>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
