// src/components/HeroSection.js
import React from "react";
import "./HeroSection.css";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay" aria-hidden="true"></div> {/* Use aria-hidden to hide decorative content */}
      <div className="hero-content">
        <h1>Welcome to T&B Liquid Gold!</h1>
        <p>
          We have a unique line of flavored creamed honeys handcrafted in
          Israel. Our honeys are a perfect way to enhance your Rosh Hashana and
          they also make a perfect gift! Check out our full collection and enjoy
          the most delicious honey on earth.
        </p>
        <Link to="/honeyCollection" className="cta-btn">
          Explore Our Collection
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
