import React from "react";
import { useNavigate } from "react-router-dom";
import "./Canceled.css";

function Canceled() {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate("/checkout"); // Navigate to the checkout without reloading
  };

  return (
    <div className="canceled-container">
      <div className="canceled-card">
        <h2>Payment Canceled</h2>
        <p>It seems like your payment was not completed.</p>
        <p>If you have any questions, please contact us for support.</p>
        <button className="canceled-button" onClick={handleTryAgain}>
          Try Again
        </button>
      </div>
    </div>
  );
}

export default Canceled;
