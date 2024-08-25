const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Stripe = require("stripe");
const axios = require("axios");

dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies, excluding the webhook endpoint
app.use(
  express.json({
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

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

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items, email } = req.body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: item.price_data.currency,
        product_data: {
          name: item.price_data.product_data.name,
          images: [item.url],
        },
        unit_amount: item.price_data.unit_amount,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/canceled`,
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ["US", "IL"], // Specify the allowed shipping countries
      },
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint to handle events from Stripe
app.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Ensure raw body parsing for webhook
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook received:", event.type);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      console.log("Processing checkout.session.completed event");
      const session = event.data.object;

      console.log("Full session object:", session);

      const customerEmail = session.customer_details.email;
      const shippingDetails = session.customer_details.address;

      if (!customerEmail) {
        console.error("No customer email provided. Cannot send email.");
        return res.sendStatus(200);
      }

      // Retrieve the session line items
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );
        console.log("Line items:", lineItems.data);

        // Create HTML list of purchased items
        const itemsListHtml = lineItems.data
          .map(
            (item) => `
            <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">
              <strong>${item.quantity}x ${item.description}</strong><br>
              <span style="color: #777;">Price: ${
                item.currency.toUpperCase() === "USD" ? "$" : "₪"
              }${(item.amount_total / 100).toFixed(2)}</span>
            </li>`
          )
          .join("");

        // Format the shipping address
        const shippingAddressHtml = `
          <p>${shippingDetails.line1}</p>
          ${shippingDetails.line2 ? `<p>${shippingDetails.line2}</p>` : ""}
          <p>${shippingDetails.city}, ${
          shippingDetails.state ? shippingDetails.state : ""
        } ${shippingDetails.postal_code}</p>
          <p>${shippingDetails.country}</p>
        `;

        // Send the confirmation email to the customer
        const mailOptionsCustomer = {
          from: process.env.MAIL_USERNAME,
          to: customerEmail,
          subject: "Order Confirmation",
          html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #7c2234; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Order Confirmation</h2>
                <p style="font-size: 16px;">Dear Customer,</p>
                <p style="font-size: 16px;">Thank you for your purchase! We are currently processing your order. Below are the details of your order:</p>
                
                <h3 style="color: #333; margin-bottom: 10px;">Order Details</h3>
                <ul style="font-size: 16px; list-style-type: none; padding: 0;">
                  ${itemsListHtml}
                </ul>

                <h3 style="color: #333; margin-bottom: 10px;">Shipping Address</h3>
                <div style="font-size: 16px;">
                  ${shippingAddressHtml}
                </div>
                
                <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">Thank you for shopping with us!</p>
              </div>
            `,
        };

        // Send email to customer
        transporter.sendMail(mailOptionsCustomer, (error, info) => {
          if (error) {
            console.error("Error sending email to customer:", error);
          } else {
            console.log("Email sent to customer:", info.response);
          }
        });

        // Send a copy of the order details to your personal email
        const mailOptionsAdmin = {
          from: process.env.MAIL_USERNAME,
          to: process.env.PERSONAL_EMAIL,
          subject: `New Order from ${customerEmail}`,
          html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #7c2234; border-bottom: 2px solid #ddd; padding-bottom: 10px;">New Order Received</h2>
                <p style="font-size: 16px;">You have received a new order. Below are the details:</p>
                
                <h3 style="color: #333; margin-bottom: 10px;">Order Details</h3>
                <ul style="font-size: 16px; list-style-type: none; padding: 0;">
                  ${itemsListHtml}
                </ul>

                <h3 style="color: #333; margin-bottom: 10px;">Shipping Address</h3>
                <div style="font-size: 16px;">
                  ${shippingAddressHtml}
                </div>

                <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">Customer Email: ${customerEmail}</p>
              </div>
            `,
        };

        // Send email to admin
        transporter.sendMail(mailOptionsAdmin, (error, info) => {
          if (error) {
            console.error("Error sending email to admin:", error);
          } else {
            console.log("Email sent to admin:", info.response);
          }
        });
      } catch (err) {
        console.error("Error retrieving line items:", err);
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

app.post("/send-email", async (req, res) => {
  const { name, email, number, message } = req.body;

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: process.env.PERSONAL_EMAIL,
    subject: "New Contact Form Submission",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #7c2234; border-bottom: 2px solid #ddd; padding-bottom: 10px;">New Contact Form Submission</h2>
        <p style="font-size: 16px;">You have received a new message from your website's contact form.</p>
        <p style="font-size: 16px;"><strong>Name:</strong> ${name}</p>
        <p style="font-size: 16px;"><strong>Email:</strong> ${email}</p>
        <p style="font-size: 16px;"><strong>Phone Number:</strong> ${number}</p>
        <p style="font-size: 16px;"><strong>Message:</strong></p>
        <p style="font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        <p style="font-size: 14px; color: #777; margin-top: 20px; text-align: center;">This email was sent from your website's contact form.</p>
      </div>
    `,
  };

  try {
    // Send email
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
  console.log(`Server is running on port ${PORT}`);
});
