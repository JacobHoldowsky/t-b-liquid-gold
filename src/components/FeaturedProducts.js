import React from "react";
import { HashLink } from "react-router-hash-link"; // Import HashLink
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check
import "./FeaturedProducts.css";

function FeaturedProducts() {
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -100; // Adjust this value to match the height of your sticky header
    window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
  };

  const giftPackagesPhoto =
    shopRegion === "US"
      ? "Board of Four no plastic-min.jpg"
      : "gift packages-min.jpg";

  return (
    <section className="featured-products">
      <h2>Our Featured Products</h2>
      <div className="product-grid">
        {/* Gift Packages */}
        <div className="product-card">
          <img src="Honey Collection-min.png" alt="Deluxe Box" />
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
          <img src={giftPackagesPhoto} alt="For Her" />
          <HashLink
            smooth
            to="/giftPackages"
            scroll={scrollWithOffset}
            className="cta-btn"
          >
            Shop Gift Packages
          </HashLink>
        </div>
        {shopRegion !== "US" && (
          <div className="product-card">
            <img
              src="Mini four collection board with plastic-min.jpg"
              alt="Collection Plus"
            />

            <HashLink
              smooth
              to="/corporateGifts"
              scroll={scrollWithOffset}
              className="cta-btn"
            >
              Shop Corporate Gifts
            </HashLink>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
