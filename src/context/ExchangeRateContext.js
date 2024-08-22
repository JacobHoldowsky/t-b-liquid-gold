import React, { createContext, useState, useEffect } from "react";

export const ExchangeRateContext = createContext();

export const ExchangeRateProvider = ({ children }) => {
  const [exchangeRate, setExchangeRate] = useState(null);

  const API_URL =
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""; // Use relative path in production

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Make the API request without Authorization header
        const response = await fetch(`${API_URL}/api/exchange-rate`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Parse the JSON response
        const data = await response.json();
        console.log("data", data);

        // Check if rates are present in the response
        if (data.rates) {
          setExchangeRate(data.rates);
        } else {
          console.error("Error fetching exchange rate: No rates found");
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error.message || error);
      }
    };

    fetchExchangeRate();
  }, [API_URL]);

  return (
    <ExchangeRateContext.Provider value={exchangeRate}>
      {children}
    </ExchangeRateContext.Provider>
  );
};
