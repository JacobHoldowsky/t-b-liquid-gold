// src/context/CurrencyContext.js
import React, { createContext, useState } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('Dollar');

  const toggleCurrency = (selectedCurrency) => {
    setCurrency(selectedCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
