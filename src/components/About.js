import React from "react";
import "./About.css";
import { Link } from "react-router-dom";

function About() {
  return (
    <section className="about">
      <div className="about-content">
        <h2>About Us</h2>
        <p>Welcome to T&B Liquid Gold.</p>
        <p>
          At T&B Liquid Gold, we are dedicated to the art of gifting. Our specialty lies in crafting exquisitely wrapped gifts for every occasion. Whether you're celebrating a birthday, wedding, or holiday, we offer a carefully curated selection of presents designed to bring joy to both the giver and the recipient. Each gift is thoughtfully assembled to ensure it leaves a lasting impression. Explore our collection and elevate your gifting experience with T&B Liquid Gold.
        </p>
        <Link to="/catalog" className="cta-btn">
          Browse Our Collection
        </Link>
      </div>
    </section>
  );
}

export default About;
