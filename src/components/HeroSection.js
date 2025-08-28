// src/components/HeroSection.js
import React from "react";
import "./HeroSection.css";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check
import { Link } from "react-router-dom";

function HeroSection() {
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  return (
    <>
      <section className="hero-section">
        <div className="hero-overlay" aria-hidden="true"></div>{" "}
        {/* Use aria-hidden to hide decorative content */}
        <div className="hero-content">
          <h1>Welcome to T&B Liquid Gold!</h1>
          <p>
            We have a unique line of flavored creamed honeys handcrafted in
            Israel. Our honeys are a perfect way to enhance your Rosh Hashana
            and they also make a perfect gift! Check out our full collection and
            enjoy the most delicious honey on earth.
          </p>
          <Link to="/honeyCollection" className="cta-btn">
            Explore Our Collection
          </Link>
        </div>
      </section>
      <div className="kashrut-box">
        {shopRegion === "US" && (
          <>
            <p className="us-kashrut-disclaimer">** Note for US Customers **</p>
            <p className="us-kashrut-disclaimer">
              All honey jars on the US site are imported from Israel and are
              under the same hashgacha as the Israel site (Vaad Hakashrus Rabbi
              Shmuel Weiner). The gift packages that are listed on the US site
              are not included under this hashgacha. Each gift package on the US
              site lists the hashgacha of the items included in the package.
              Please review this carefully before ordering to make sure it meets
              your standards of kashrus.
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default HeroSection;
