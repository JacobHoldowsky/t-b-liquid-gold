// src/context/CurrencyContext.js
import React, { createContext, useState, useEffect } from "react";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // Retrieve the currency from localStorage or default to 'Dollar'
  const [currency, setCurrency] = useState(() => {
    const storedCurrency = localStorage.getItem("currency");
    return storedCurrency ? storedCurrency : "Dollar";
  });

  // Function to toggle currency and save it to localStorage
  const toggleCurrency = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    localStorage.setItem("currency", selectedCurrency); // Store in localStorage
  };

  // Optionally, useEffect to handle side effects when currency changes
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
