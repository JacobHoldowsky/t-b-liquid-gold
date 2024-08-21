import React, { createContext, useState, useEffect } from "react";

export const ExchangeRateContext = createContext();

export const ExchangeRateProvider = ({ children }) => {
  const [exchangeRate, setExchangeRate] = useState(null);

  const apiUrl =
    process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const token = process.env.VERCEL_ACCESS_TOKEN; // Access the environment variable
        const response = await fetch(`${apiUrl}/api/exchange-rate`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.rate) {
          setExchangeRate(data.rate);
        } else {
          console.error("Error fetching exchange rate:", data.error);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchExchangeRate();
  }, [apiUrl]);

  return (
    <ExchangeRateContext.Provider value={exchangeRate}>
      {children}
    </ExchangeRateContext.Provider>
  );
};
