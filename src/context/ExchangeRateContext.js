import React, { createContext, useState, useEffect } from "react";

export const ExchangeRateContext = createContext();

export const ExchangeRateProvider = ({ children }) => {
  const [exchangeRate, setExchangeRate] = useState(null);

  // Determine API URL based on the environment
  const API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000"
      : "https://t-b-liquid-gold.vercel.app"; // Use Vercel API URL in production

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Use the Vercel Access Token stored in an environment variable
        const token = process.env.REACT_APP_VERCEL_ACCESS_TOKEN;

        // Make the API request
        const response = await fetch(`${API_URL}/api/exchange-rate`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Use the access token for authentication
          },
        });

        // Parse the JSON response
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
  }, [API_URL]);

  return (
    <ExchangeRateContext.Provider value={exchangeRate}>
      {children}
    </ExchangeRateContext.Provider>
  );
};
