import React, { createContext, useState, useEffect } from 'react';

export const ExchangeRateContext = createContext();

export const ExchangeRateProvider = ({ children }) => {
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/exchange-rate");
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
  }, []);

  return (
    <ExchangeRateContext.Provider value={exchangeRate}>
      {children}
    </ExchangeRateContext.Provider>
  );
};
