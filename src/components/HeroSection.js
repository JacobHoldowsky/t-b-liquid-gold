import React from "react";
import "./HeroSection.css";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="text-container">
          <h1>Welcome to Pretty Presents by Chana</h1>
          <p>Discover unique and beautiful gifts curated for every occasion shipped nationwide</p>

          <Link to="/catalog" className="cta-btn">
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
