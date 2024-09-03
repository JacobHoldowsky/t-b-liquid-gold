import React from "react";

const QuantitySelector = ({ quantity, handleQuantityChange }) => (
  <div className="quantity-selector">
    <label htmlFor="quantity">Quantity:</label>
    <select
      id="quantity"
      value={quantity}
      onChange={handleQuantityChange}
      className="select-dropdown"
    >
      {[...Array(10).keys()].map((num) => (
        <option key={num + 1} value={num + 1}>
          {num + 1}
        </option>
      ))}
    </select>
  </div>
);

export default QuantitySelector;
