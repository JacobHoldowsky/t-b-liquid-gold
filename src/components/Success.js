import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Success.css";

function Success({ setCart }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the cart on the success page
    setCart([]);
    localStorage.removeItem("cart");
  }, [setCart, navigate]);

  const handleContinueShopping = () => {
    navigate("/"); // Navigate to the homepage without reloading
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <h2>Payment Successful!</h2>
        <p>Thank you for your purchase!</p>
        <p>
          Your order is being processed, and you will receive an email
          confirmation shortly.
        </p>
        <button className="success-button" onClick={handleContinueShopping}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default Success;
