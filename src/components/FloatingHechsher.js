import "./FloatingHechsher.css";

import { useShopContext } from "../context/ShopContext";

function FloatingHechsher() {
  // Image lives in /public so we can reference it from the root
  const hechsherSrc = "/hechsher%205-min.png"; // note the %20 for the space
  const { shopRegion } = useShopContext();

  return (
    shopRegion !== "US" && (
      <div className="floating-hechsher" aria-label="Hechsher badge">
        <img
          src={hechsherSrc}
          alt="Kosher certification (Hechsher)"
          className="hechsher-img"
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  );
}

export default FloatingHechsher;
