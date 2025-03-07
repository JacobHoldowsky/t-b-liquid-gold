import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import "./FloatingCartButton.css";

function FloatingCartButton({ cartItemCount }) {
  return (
    <Link to="/checkout" className="floating-cart-button">
      <FontAwesomeIcon icon={faShoppingCart} />
      {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
    </Link>
  );
}

export default FloatingCartButton; 