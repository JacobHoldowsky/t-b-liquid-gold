const axios = require("axios");

module.exports = async (req, res) => {
  try {
    // Make the request to a public exchange rate API
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );

    // Return the data without unnecessary headers
    res.json(response.data);
  } catch (error) {
    console.error("Error in exchange-rate API:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
