import React from "react";
import "./About.css";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
      <div className="about-content">
        <h2>About Us</h2>
        <p>
          Hi, I’m Batya! About 12 years ago I began handcrafting a unique line
          of flavored creamed honeys for Rosh Hashana. It started as a fun
          hobby. I loved creating something different than the classic honey
          that most people dip their apples into.
        </p>
        <p>
          This was a different honey experience, tasted incredible, and added an
          extra touch to the Rosh Hashana table. Very quickly that hobby turned
          into a deep passion for sharing sweetness to people all over the
          world.
        </p>

        <p>
          We have 7 rich flavors of creamed honeys all handracfted in Israel.
        </p>
        <p>Every jar is made with lots of love.</p>
        <p>We look forward to sharing the goodness with you.</p>
        <p>
          Thanks, <br />
          Batya
        </p>
        <Link to="/honeyCollection" className="cta-btn">
          Browse Our Collection
        </Link>
      </div>
    </div>
  );
}

export default About;
