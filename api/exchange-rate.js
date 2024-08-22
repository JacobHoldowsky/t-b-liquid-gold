// File: api/exchange-rate.js
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const token = process.env.VERCEL_ACCESS_TOKEN; // Server-side access token
    const response = await axios.get(
      "https://api.vercel.com/api/exchange-rate",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
