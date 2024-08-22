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

// File: api/send-email.js
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  const { name, email, number, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_USE_TLS === "true",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

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
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
};
