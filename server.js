const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
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
    const {
      items,
      giftNote,
      shippingDetails,
      deliveryCharge,
      selectedDeliveryOption,
      isSponsorHoneyBoardInCart,
      promoCode, // Include promoCode in the request body
      currency,
      exchangeRate,
      specialDeliveryOnly,
    } = req.body;

    // Calculate subtotal for items only, excluding delivery charge
    const subtotal = items.reduce((total, item) => {
      return total + item.price_data.unit_amount * item.quantity;
    }, 0);

    // Check if a valid promo code is entered and calculate the discount
    let discountRate = 0;
    if (promoCode.includes("5")) {
      discountRate = 0.05; // 5% discount
    }

    // Calculate the total discount amount
    const discountAmount = Math.round(subtotal * discountRate);

    // Apply the discount manually to each item price proportionally
    const adjustedItems = items.map((item) => {
      // Calculate discount for each item proportionally

      const itemDiscount = Math.round(
        item.price_data.unit_amount * discountRate
      );
      const adjustedUnitAmount = item.price_data.unit_amount - itemDiscount;

      // Ensure adjustedUnitAmount is non-negative and an integer
      return {
        price_data: {
          currency: item.price_data.currency,
          product_data: {
            name: item.price_data.product_data.name,
            metadata: {
              logoUrl: item.price_data.product_data.metadata?.logoUrl || null,
              flavors: item.price_data.product_data.metadata?.flavors || "",
              ...(giftNote && { giftNote: giftNote }),
            },
          },
          unit_amount: adjustedUnitAmount, // Adjusted price per unit
        },
        quantity: item.quantity,
      };
    });

    // Create line items for Stripe
    const lineItems = adjustedItems;

    // Add delivery charge as a separate line item (not discounted)
    if (
      selectedDeliveryOption &&
      deliveryCharge > 0 &&
      selectedDeliveryOption !== "Sponsor a Honey Board Flat Rate" &&
      !(isSponsorHoneyBoardInCart && items.length === 1)
    ) {
      lineItems.push({
        price_data: {
          currency: currency === "Dollar" ? "usd" : "ils", // Set currency as needed, assuming USD here
          product_data: {
            name: `Delivery Charge - ${selectedDeliveryOption}`,
            metadata: {
              note: "Delivery charge is not discounted", // Add a note in the metadata
            },
          },
          unit_amount: deliveryCharge * 100, // Convert to cents
        },
        quantity: 1,
      });
    }
    if (isSponsorHoneyBoardInCart) {
      const sponsorHoneyBoardItems = items.filter(
        (item) => item.price_data.product_data.name === "Sponsor a Honey Board "
      );

      let sponsorDeliveryFee =
        currency === "Dollar" ? 10 * 100 : 10 * exchangeRate * 100; // $10 delivery fee in cents
      if (!currency === "Dollar")
        sponsorDeliveryFee = sponsorDeliveryFee * exchangeRate;

      lineItems.push({
        price_data: {
          currency: currency === "Dollar" ? "usd" : "ils", // Set currency as needed, assuming USD here
          product_data: {
            name: `Delivery Charge - Sponsor a Honey Board Flat Rate`,
            metadata: {
              note: "Delivery charge is not discounted", // Add a note in the metadata
            },
          },
          unit_amount: sponsorDeliveryFee,
        },
        quantity: sponsorHoneyBoardItems[0].quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/canceled`,
      metadata: {
        ...(giftNote && { giftNote: giftNote }),
        fullName: shippingDetails.fullName,
        email: shippingDetails.email,
        number: shippingDetails.number,
        recipientName: shippingDetails.recipientName,
        address: shippingDetails.address,
        homeType: shippingDetails.homeType,
        ...(shippingDetails.homeType === "building" && {
          apartmentNumber: shippingDetails.apartmentNumber,
          floor: shippingDetails.floor,
          code: shippingDetails.code,
        }),
        city: shippingDetails.city,
        zipCode: shippingDetails.zipCode,
        specialDeliveryOnly: specialDeliveryOnly,
        contactNumber: shippingDetails.contactNumber,
        promoCode: promoCode || "", // Include promo code in the metadata
        discountInfo:
          "5% discount applied to subtotal only, excluding delivery charge",
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
    } catch (err) {
      return res.sendStatus(400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details.email;
      const giftNote = session.metadata.giftNote || ""; // Retrieve gift note from session metadata
      let fullName = session.metadata.fullName;
      let email = session.metadata.email;
      let number = session.metadata.number;
      let recipientName = session.metadata.recipientName;
      let address = session.metadata.address;
      let homeType = session.metadata.homeType;
      let apartmentNumber = "";
      let floor = "";
      let code = "";

      if (homeType === "building") {
        apartmentNumber = session.metadata.apartmentNumber;
        floor = session.metadata.floor;
        code = session.metadata.code;
      }

      let city = session.metadata.city;
      let zipCode = session.metadata.zipCode;
      let contactNumber = session.metadata.contactNumber;
      let specialDeliveryOnly = session.metadata.specialDeliveryOnly;

      if (!customerEmail) {
        console.error("No customer email provided. Cannot send email.");
        return res.sendStatus(200);
      }

      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { expand: ["data.price.product"] } // Ensure product details are included
        );

        // Map of product name to attachments for logo images
        const attachments = await Promise.all(
          lineItems.data.map(async (item) => {
            // Retrieve the logo URL from metadata
            let logoUrl = item.price.product.metadata.logoUrl;
            const productName = item.price.product.name; // Get the product name

            if (logoUrl) {
              const fileName = `${productName.replace(
                / /g,
                "_"
              )}_Logo_${path.basename(logoUrl)}`;
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

        const capitalizedHomeType =
          homeType.charAt(0).toUpperCase() + homeType.slice(1);

        // HTML for Shipping Address
        let shippingAddressHtml = specialDeliveryOnly === 'true'
          ? `
  <h3 style="color: #333; margin-top: 20px;">Customer Details</h3>
  <p><strong>Full Name:</strong> ${fullName}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Number:</strong> ${number}</p>
`
          : `
  <h3 style="color: #333; margin-top: 20px;">Customer Details</h3>
  <p><strong>Full Name:</strong> ${fullName}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Number:</strong> ${number}</p>
  <h3 style="color: #333; margin-top: 20px;">Delivery Information</h3>
  <p><strong>Recipient Name:</strong> ${recipientName}</p>
  <p><strong>Address:</strong> ${address}</p>
  <p><strong>Home Type:</strong> ${capitalizedHomeType}</p>
  ${
    homeType === "building"
      ? `<p><strong>Apartment Number:</strong> ${apartmentNumber}</p>
         <p><strong>Floor:</strong> ${floor}</p>
         <p><strong>Building Code:</strong> ${code}</p>`
      : ""
  }
  <p><strong>City:</strong> ${city}</p>
  <p><strong>Zip Code:</strong> ${zipCode}</p>
  <p><strong>Recipient Contact Number:</strong> ${contactNumber}</p>
`;

        // Gift Note HTML
        const giftNoteHtml = giftNote
          ? `<h3 style="color: #333; margin-top: 20px;">Gift Note</h3>
             <p style="font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #333;">${giftNote}</p>`
          : "";

        // Email HTML for Customer
        const customerEmailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <header style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
              <h2 style="color: #7c2234;">Order Confirmation</h2>
            </header>
            <p style="font-size: 16px;">Dear ${fullName},</p>
            <p style="font-size: 16px;">Thank you for your purchase! We are currently processing your order. Below are the details of your order:</p>
            
            <h3 style="color: #333; margin-bottom: 10px;">Order Details</h3>
            <ul style="font-size: 16px; list-style-type: none; padding: 0;">
              ${itemsListHtml}
            </ul>

            ${giftNoteHtml}

            ${shippingAddressHtml}
            
            <footer style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px;">
              <p style="font-size: 14px; color: #777;">Thank you for shopping with us!</p>
              <p style="font-size: 14px; color: #777;">If you have any questions, feel free to contact us via our contact page form.</p>
            </footer>
          </div>
        `;

        // Email HTML for Seller
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <header style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
              <h2 style="color: #7c2234;">New Order Received</h2>
            </header>
            <p style="font-size: 16px;">You have received a new order from ${fullName} (${customerEmail}). Below are the details:</p>
            
            <h3 style="color: #333; margin-bottom: 10px;">Order Details</h3>
            <ul style="font-size: 16px; list-style-type: none; padding: 0;">
              ${itemsListHtml}
            </ul>

            ${giftNoteHtml}

            ${shippingAddressHtml}
            
          </div>
        `;

        // Mail Options for Customer
        const mailOptionsCustomer = {
          from: process.env.MAIL_USERNAME,
          to: customerEmail,
          subject: "Order Confirmation",
          html: customerEmailHtml,
          attachments: validAttachments,
        };

        // Send email to customer
        transporter.sendMail(mailOptionsCustomer, (error, info) => {
          if (error) {
            console.error("Error sending email to customer:", error);
          } else {
          }
        });

        // Mail Options for Admin
        const mailOptionsAdmin = {
          from: process.env.MAIL_USERNAME,
          to: process.env.PERSONAL_EMAIL,
          subject: `New Order from ${customerEmail}`,
          html: adminEmailHtml,
          attachments: validAttachments,
        };

        // Send email to admin
        transporter.sendMail(mailOptionsAdmin, (error, info) => {
          if (error) {
            console.error("Error sending email to admin:", error);
          } else {
          }

          // Delete downloaded images
          validAttachments.forEach((attachment) => {
            fs.unlink(attachment.path, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          });
        });

        // Collect the S3 keys of logos to delete
        const s3KeysToDelete = lineItems.data
          .map((item) => {
            const logoUrl = item.price.product.metadata?.logoUrl;
            if (logoUrl) {
              const key = logoUrl.split("/").pop(); // Extract the file name from the URL
              return { Key: key };
            }
            return null;
          })
          .filter(Boolean); // Remove null values

        // Delete each image from S3
        await Promise.all(
          s3KeysToDelete.map(async (s3Key) => {
            try {
              const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key.Key,
              };
              const command = new DeleteObjectCommand(deleteParams);
              await s3Client.send(command);
            } catch (err) {
              console.error(`Failed to delete S3 object ${s3Key.Key}:`, err);
            }
          })
        );

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
