// src/context/ShopContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Initialize shopRegion from localStorage or default to "US"
  const [shopRegion, setShopRegion] = useState(() => {
    // temporary
    return "Israel"
    const storedRegion = localStorage.getItem("shopRegion");
    return storedRegion ? storedRegion : "Israel";
  });

  // Update localStorage whenever shopRegion changes
  useEffect(() => {
    localStorage.setItem("shopRegion", shopRegion);
  }, [shopRegion]);

  const toggleShopRegion = () => {
    setShopRegion((prevRegion) => (prevRegion === "US" ? "Israel" : "US"));
  };

  return (
    <ShopContext.Provider value={{ shopRegion, toggleShopRegion }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShopContext = () => useContext(ShopContext);
