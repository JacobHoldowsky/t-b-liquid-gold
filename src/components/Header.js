import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ cartItemCount }) {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="t&bLiquidGoldLogo.png" alt="TnB Liquid Gold" />
        </Link>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/catalog">Catalog</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li className="cart-link">
            <Link to="/checkout">
              Checkout
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
