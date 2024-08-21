const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_USE_TLS === "true",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Define routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/exchange-rate", async (req, res) => {
  const url = `https://api.exchangerate-api.com/v4/latest/USD`;
  try {
    const response = await axios.get(url);
    const rate = response.data.rates.ILS;
    if (rate) {
      res.json({ rate });
    } else {
      res.status(404).json({ error: "Exchange rate for ILS not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/send-email", async (req, res) => {
  const { name, email, number, message } = req.body;

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: process.env.PERSONAL_EMAIL,
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nNumber: ${number}\nMessage: ${message}`,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Failed to send email:", error);
    console.log("hiiii", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
