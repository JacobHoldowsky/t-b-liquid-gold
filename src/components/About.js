import React from "react";
import "./About.css";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
      <div className="about-content">
        <h2>About Us</h2>
        <p>
          Welcome to <strong>T&B Liquid Gold</strong>, a flavored creamed honey
          company in the heart of Jerusalem. Our famous handcrafted honey is
          the best stuff on earth! We offer the following 7 flavors: Vanilla,
          cinnamon, sea salt, chocolate, blueberry, pumpkin, and bourbon. All
          of our products are made of pure honey and natural flavors. Every jar
          is made with lots of love. We can't wait to serve you!
        </p>
        <p>
          <strong>Kashrus:</strong> We are under the strict supervision of Rabbi
          Weiner of ZNT Kosher.
        </p>
        <img
          className="kashrus"
          src="hechsher 5.png"
          alt="Kashrus Certification"
        />
        <p>
          <strong>Delivery:</strong> We deliver anywhere in Israel. Delivery
          rates vary based on location. Deliveries in Jerusalem range between
          $10-$20. Deliveries to RBS are $15. For any other location in Israel,
          please reach out to us and we will give you a quote. Pickup is in
          Ramat Eshkol, Jerusalem. We have distributors in many locations in the
          US so if you would like to purchase our honeys in the US, please check
          out the list of distributors.
        </p>
        <p>
          <strong>Allergy information:</strong> All of our honey flavors are
          dairy-free, gluten-free, and nut-free. Made in the same facility as
          nuts, dairy, and gluten.
        </p>
        <p>
          <strong>How to store:</strong> Store in a cool/room temperature place
          for up to 1 year. Refrigeration is not needed.
        </p>
        <Link to="/honeyCollection" className="cta-btn">
          Browse Our Collection
        </Link>
      </div>
    </div>
  );
}

export default About;
