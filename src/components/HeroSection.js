import React from "react";
import "./HeroSection.css";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>T&B Liquid Gold</h1>
        <p>
          Discover a curated collection of exquisite gifts, perfect for every occasion and delivered nationwide.
        </p>
        <Link to="/catalog" className="cta-btn">
          Explore Our Collection
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
