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
app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/exchange-rate", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );

    const ilsRate = response.data.rates.ILS;

    if (ilsRate) {
      res.json({ ILS: ilsRate });
    } else {
      res.status(404).json({ error: "ILS rate not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/send-email", async (req, res) => {
  const { name, email, number, message } = req.body;

  console.log("Received data:", { name, email, number, message }); // Add this line

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: process.env.PERSONAL_EMAIL,
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nNumber: ${number}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Correctly enclosed in backticks for template literals
});
