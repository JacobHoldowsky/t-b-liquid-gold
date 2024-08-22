// File: api/exchange-rate.js
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    // Make the request to get only the ILS rate
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );

    // Extract the ILS rate from the response
    const ilsRate = response.data.rates.ILS;

    if (ilsRate) {
      res.json({ ILS: ilsRate });
    } else {
      res.status(404).json({ error: "ILS rate not found" });
    }
  } catch (error) {
    console.error("Error in exchange-rate API:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
