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
          <img src="Deluxe Box $120.jpg" alt="Deluxe Box" />
          <h3>Deluxe Box</h3>
          <p>$120 / ₪360</p>
          <HashLink
            smooth
            to="/giftPackages"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Gift Packages
          </HashLink>
        </div>
        {/* Our Collection */}
        <div className="product-card">
          <img src="vanilla small jar.jpg" alt="Vanilla Creamed Honey" />
          <h3>Vanilla Creamed Honey</h3>
          <p>$15 / ₪60</p>
          <HashLink
            smooth
            to="/honeyCollection"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Our Collection
          </HashLink>
        </div>
        {/* Corporate Gifts */}
        <div className="product-card">
          <img src="For Her $55.jpg" alt="For Her" />
          <h3>For Her</h3>
          <p>$55 / ₪180</p>
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
