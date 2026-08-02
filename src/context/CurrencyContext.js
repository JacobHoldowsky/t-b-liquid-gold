// src/context/CurrencyContext.js
import React, { createContext } from "react";
import { useShopContext } from "./ShopContext";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const { shopRegion } = useShopContext();
  const currency = shopRegion === "US" ? "Dollar" : "Shekel";

  return (
    <CurrencyContext.Provider value={{ currency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
