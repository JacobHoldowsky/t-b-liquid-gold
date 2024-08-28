const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Stripe = require("stripe");
const axios = require("axios");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporary storage before uploading to S3
const https = require("https");
const fs = require("fs");
const path = require("path");

dotenv.config();
const app = express();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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

function emptyUploadsDirectory() {
  const uploadsDir = path.join(__dirname, "uploads");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error(`Error reading uploads directory: ${err}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${filePath}`, err);
        } else {
          console.log(`File deleted: ${filePath}`);
        }
      });
    });
  });
}

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

app.post("/upload-logo", upload.single("file"), async (req, res) => {
  const file = req.file;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${file.originalname}`, // Unique file name
    Body: require("fs").createReadStream(file.path),
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(command);
    const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    res.status(200).json({ success: true, url: location });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ success: false, message: "Failed to upload file" });
  }
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
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    const { items, giftNote } = req.body; // Retrieve items and giftNote from the request body

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items found in the request");
    }

    let hasLogoCharge = false;

    const lineItems = items.map((item) => {
      const logoUrl = item.price_data.product_data.metadata.logoUrl;
      console.log("logoUrl", logoUrl);

      if (logoUrl) {
        hasLogoCharge = true; // Set flag to add a one-time logo charge
      }

      return {
        price_data: {
          currency: item.price_data.currency,
          product_data: {
            name: item.price_data.product_data.name,
            metadata: {
              logoUrl: logoUrl, // Store the logo URL in metadata without showing it in the description
              ...(giftNote && { giftNote: giftNote }), // Add the gift note to metadata if it exists
            },
          },
          unit_amount: item.price_data.unit_amount,
        },
        quantity: item.quantity,
      };
    });

    // Add a one-time $50 charge for the logo if any item includes a logo
    if (hasLogoCharge) {
      lineItems.push({
        price_data: {
          currency: "usd", // Assuming the charge should always be in USD
          product_data: {
            name: "Custom Logo",
          },
          unit_amount: 5000, // $50 charge in cents
        },
        quantity: 1, // One-time charge
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/canceled`,
      shipping_address_collection: {
        allowed_countries: ["US", "IL"],
      },
      metadata: {
        ...(giftNote && { giftNote: giftNote }), // Include the gift note in the session metadata if it exists
      },
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint to handle events from Stripe
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
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

    if (event.type === "checkout.session.completed") {
      console.log("Processing checkout.session.completed event");
      const session = event.data.object;
      const customerEmail = session.customer_details.email;
      const shippingDetails = session.customer_details.address;
      const giftNote = session.metadata.giftNote || ""; // Retrieve gift note from session metadata

      if (!customerEmail) {
        console.error("No customer email provided. Cannot send email.");
        return res.sendStatus(200);
      }

      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { expand: ["data.price.product"] } // Ensure product details are included
        );

        const attachments = await Promise.all(
          lineItems.data.map(async (item) => {
            // Retrieve the logo URL from metadata
            let logoUrl = item.price.product.metadata.logoUrl;
            console.log(`Processed Logo URL: ${logoUrl}`);

            if (logoUrl) {
              const fileName = path.basename(logoUrl);
              const filePath = path.join(__dirname, fileName);

              try {
                await new Promise((resolve, reject) => {
                  const file = fs.createWriteStream(filePath);
                  https
                    .get(logoUrl, (response) => {
                      if (response.statusCode === 200) {
                        response.pipe(file);
                        file.on("finish", () => file.close(resolve));
                      } else {
                        reject(
                          `Failed to download image: ${response.statusCode}`
                        );
                      }
                    })
                    .on("error", (err) => {
                      fs.unlink(filePath, () => {}); // Delete the file on error
                      reject(`Download error: ${err.message}`);
                    });
                });

                return { filename: fileName, path: filePath };
              } catch (error) {
                console.error("Error downloading image:", error);
              }
            }
            return null;
          })
        );

        const validAttachments = attachments.filter(Boolean);
        console.log("Attachments to send:", validAttachments);

        // Create HTML list of purchased items
        const itemsListHtml = lineItems.data
          .map((item) => {
            const isCustomLogoCharge = item.description.includes("Custom Logo");
            return `
              <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                <strong>${item.quantity}x ${item.description}${
              isCustomLogoCharge ? " (see attachment)" : ""
            }</strong><br>
                <span style="color: #777;">Price: ${
                  item.currency.toUpperCase() === "USD" ? "$" : "₪"
                }${(item.amount_total / 100).toFixed(2)}</span>
              </li>
            `;
          })
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

        // Include the gift note in the email if it exists
        const giftNoteHtml = giftNote
          ? `<h3 style="color: #333; margin-top: 20px;">Gift Note</h3>
             <p style="font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #333;">${giftNote}</p>`
          : "";

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

              ${giftNoteHtml} <!-- Include the gift note here -->

              <h3 style="color: #333; margin-bottom: 10px;">Shipping Address</h3>
              <div style="font-size: 16px;">
                ${shippingAddressHtml}
              </div>
              
              <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">Thank you for shopping with us!</p>
            </div>
          `,
          attachments: validAttachments, // Attach the downloaded images
        };

        // Send email to customer
        transporter.sendMail(mailOptionsCustomer, (error, info) => {
          if (error) {
            console.error("Error sending email to customer:", error);
          } else {
            console.log("Email sent to customer:", info.response);
          }

          // Delete downloaded images
        });

        // Send a copy of the order details to your personal email
        const mailOptionsAdmin = {
          from: process.env.MAIL_USERNAME,
          to: process.env.PERSONAL_EMAIL,
          subject: `New Order from ${customerEmail}`,
          html: mailOptionsCustomer.html,
          attachments: validAttachments, // Attach the downloaded images
        };

        // Send email to admin
        transporter.sendMail(mailOptionsAdmin, (error, info) => {
          if (error) {
            console.error("Error sending email to admin:", error);
          } else {
            console.log("Email sent to admin:", info.response);
          }

          // Delete downloaded images
          validAttachments.forEach((attachment) => {
            fs.unlink(attachment.path, (err) => {
              if (err) console.error("Error deleting file:", err);
              else console.log(`File deleted: ${attachment.path}`);
            });
          });
        });

        emptyUploadsDirectory();
      } catch (err) {
        console.error("Error retrieving line items or sending email:", err);
      }
    }

    res.send();
  }
);

app.post("/send-email", async (req, res) => {
  const { name, email, number, message } = req.body;

  // Email to admin
  const mailOptionsAdmin = {
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

  // Confirmation email to the sender
  const mailOptionsSender = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "Thank you for contacting us",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #7c2234; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Thank You for Reaching Out</h2>
        <p style="font-size: 16px;">Dear ${name},</p>
        <p style="font-size: 16px;">Thank you for reaching out to us. We will respond to your inquiry shortly.</p>
        <p style="font-size: 14px; color: #777; margin-top: 20px; text-align: center;">This is an automated response to confirm we have received your message.</p>
      </div>
    `,
  };

  try {
    // Send email to admin
    await transporter.sendMail(mailOptionsAdmin);

    // Send confirmation email to sender
    await transporter.sendMail(mailOptionsSender);

    res
      .status(200)
      .json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({ success: false, message: "Failed to send emails" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
