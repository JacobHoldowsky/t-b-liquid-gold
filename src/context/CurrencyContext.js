// src/context/CurrencyContext.js
import React, { createContext } from "react";
import { useShopContext } from "./ShopContext";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const { shopRegion } = useShopContext();
  const currency = shopRegion === "US" ? "Dollar" : "Shekel";

  // Legacy manual currency persistence and toggle intentionally disabled.
  // const [currency, setCurrency] = useState(() => {
  //   const storedCurrency = localStorage.getItem("currency");
  //   return storedCurrency ? storedCurrency : "Dollar";
  // });
  //
  // const toggleCurrency = (selectedCurrency) => {
  //   setCurrency(selectedCurrency);
  //   localStorage.setItem("currency", selectedCurrency);
  // };
  //
  // useEffect(() => {
  //   localStorage.setItem("currency", currency);
  // }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
