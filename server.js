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
const crypto = require("crypto"); // Import crypto for generating random strings

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
      comments,
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

    if (promoCode === "9173") {
      discountRate = 0.998; // 5% discount
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
              ...(comments && { comments: comments }),
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
    // if (isSponsorHoneyBoardInCart) {
    //   const sponsorHoneyBoardItems = items.filter(
    //     (item) => item.price_data.product_data.name === "Sponsor a Honey Board "
    //   );

    //   let sponsorDeliveryFee = 10 * 100; // $10 delivery fee in cents
    //   if (currency !== "Dollar")
    //     sponsorDeliveryFee = sponsorDeliveryFee * exchangeRate;

    //   if (promoCode === "9173") {
    //     sponsorDeliveryFee = 10;
    //   }

    //   lineItems.push({
    //     price_data: {
    //       currency: currency === "Dollar" ? "usd" : "ils", // Set currency as needed, assuming USD here
    //       product_data: {
    //         name: `Delivery Charge - Sponsor a Honey Board Flat Rate`,
    //         metadata: {
    //           note: "Delivery charge is not discounted", // Add a note in the metadata
    //         },
    //       },
    //       unit_amount: sponsorDeliveryFee,
    //     },
    //     quantity: sponsorHoneyBoardItems[0].quantity,
    //   });
    // }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/canceled`,
      metadata: {
        ...(giftNote && { giftNote: giftNote }),
        ...(comments && { comments: comments }),
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
        state: shippingDetails.state,
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
      const giftNote = session.metadata.giftNote || "";
      const comments = session.metadata.comments || "";
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
      let state = session.metadata.state;
      let zipCode = session.metadata.zipCode;
      let contactNumber = session.metadata.contactNumber;
      let promoCode = session.metadata.promoCode;
      let specialDeliveryOnly = session.metadata.specialDeliveryOnly;

      if (!customerEmail) {
        console.error("No customer email provided. Cannot send email.");
        return res.sendStatus(200);
      }

      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { expand: ["data.price.product"] }
        );

        // Calculate the total price of all line items
        const totalAmount = lineItems.data.reduce(
          (acc, item) => acc + item.amount_total,
          0
        );

        // Format the total price in the appropriate currency format
        const formattedTotalAmount =
          session.currency.toUpperCase() === "USD"
            ? `$${(totalAmount / 100).toFixed(2)}`
            : `₪${(totalAmount / 100).toFixed(2)}`;

        // Generate a unique order number
        const generateOrderNumber = () => {
          const timestamp = Date.now().toString(36); // Base36 timestamp
          const randomString = crypto.randomBytes(4).toString("hex"); // Random 4-byte hex string
          return `ORD-${timestamp}-${randomString}`; // Order number format
        };

        const orderNumber = generateOrderNumber();

        const attachments = await Promise.all(
          lineItems.data.map(async (item) => {
            let logoUrl = item.price.product.metadata.logoUrl;
            const productName = item.price.product.name;

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
                      fs.unlink(filePath, () => {});
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

        let shippingAddressHtml =
          specialDeliveryOnly === "true"
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
  ${
    recipientName
      ? `<h3 style="color: #333; margin-top: 20px;">Delivery Information</h3>`
      : ""
  }
  ${
    recipientName
      ? `<p><strong>Recipient Name:</strong> ${recipientName}</p>`
      : ""
  }
  ${address ? `<p><strong>Address:</strong> ${address}</p>` : ""}
  

  ${homeType ? `<p><strong>Home Type:</strong> ${capitalizedHomeType}</p>` : ""}
  ${
    homeType === "building"
      ? `<p><strong>Apartment Number:</strong> ${apartmentNumber}</p>
    <p><strong>Floor:</strong> ${floor}</p>
    <p><strong>Building Code:</strong> ${code}</p>`
      : ""
  }
  ${city ? `<p><strong>City:</strong> ${city}</p>` : ""}
  
  ${
    state
      ? `<p>
    <strong>State:</strong> ${state}
    </p>`
      : ""
  }

  ${zipCode ? `<p><strong>Zip Code:</strong> ${zipCode}</p>` : ""}

  ${
    contactNumber
      ? `<p><strong>Recipient Contact Number:</strong> ${contactNumber}</p>`
      : ""
  }
  
  
`;

        const giftNoteHtml = giftNote
          ? `<h3 style="color: #333; margin-top: 20px;">Gift Note</h3>
             <p style="font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #333;">${giftNote}</p>`
          : "";

        const commentsHtml = comments
          ? `<h3 style="color: #333; margin-top: 20px;">Comments</h3>
             <p style="font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #333;">${comments}</p>`
          : "";

        // Separate product items and delivery fee
        const productItems = lineItems.data.filter(
          (item) => !item.description.toLowerCase().includes("delivery charge")
        );
        const deliveryItem = lineItems.data.find((item) =>
          item.description.toLowerCase().includes("delivery charge")
        );

        // Calculate the subtotal for product items only (without delivery fee)
        const subtotalAmount = productItems.reduce(
          (acc, item) => acc + item.amount_total,
          0
        );

        // Extract the delivery fee if it exists
        const deliveryFee = deliveryItem ? deliveryItem.amount_total : 0;

        // Calculate the final total after adding the delivery fee
        const finalTotalAmount = subtotalAmount + deliveryFee;

        // Format the amounts in the appropriate currency format
        const formattedSubtotalAmount =
          session.currency.toUpperCase() === "USD"
            ? `$${(subtotalAmount / 100).toFixed(2)}`
            : `₪${(subtotalAmount / 100).toFixed(2)}`;

        const formattedDeliveryFee =
          session.currency.toUpperCase() === "USD"
            ? `$${(deliveryFee / 100).toFixed(2)}`
            : `₪${(deliveryFee / 100).toFixed(2)}`;

        const formattedFinalTotalAmount =
          session.currency.toUpperCase() === "USD"
            ? `$${(finalTotalAmount / 100).toFixed(2)}`
            : `₪${(finalTotalAmount / 100).toFixed(2)}`;

        // Update the customer email HTML to include the totals breakdown
        const customerEmailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <header style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
      <h2 style="color: #7c2234;">Order Confirmation</h2>
      <p style="font-size: 16px; color: #777;">Order Number: <strong>${orderNumber}</strong></p>
    </header>
    <p style="font-size: 16px;">Dear ${fullName.trim()},</p>
    <p style="font-size: 16px;">Thank you for your purchase! We are currently processing your order. Below are the details of your order:</p>
    
    <h3 style="color: #333; margin-bottom: 10px;">Order Details</h3>
    <ul style="font-size: 16px; list-style-type: none; padding: 0;">
      ${itemsListHtml}
    </ul>

    <h3 style="color: #333; margin-bottom: 10px;">Price Summary</h3>
    <p style="font-size: 16px;">Total for items (without delivery fee): <strong>${formattedSubtotalAmount}</strong></p>
    <p style="font-size: 16px;">Delivery Fee: <strong>${formattedDeliveryFee}</strong></p>
    <p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 10px;">Total after adding delivery fee: <strong>${formattedFinalTotalAmount}</strong></p>

    ${giftNoteHtml}

    ${commentsHtml}

    ${shippingAddressHtml}
    
    <footer style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px;">
      <p style="font-size: 14px; color: #777;">Thank you for shopping with us!</p>
      <p style="font-size: 14px; color: #777;">If you have any questions, feel free to contact us at tandbeeliquidgold@gmail.com.</p>
    </footer>
  </div>
`;

        // Update the admin email HTML to include the totals breakdown
        const adminEmailHtml = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <header style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
      <h2 style="color: #7c2234;">New Order Received</h2>
      <p style="font-size: 16px; color: #777;">Order Number: <strong>${orderNumber}</strong></p>
    </header>
    <p style="font-size: 16px;">You have received a new order from ${fullName} (${customerEmail}). Below are the details:</p>
    
    <h3 style="color: #333; margin-bottom: 10px;">Order Details</h3>
    <ul style="font-size: 16px; list-style-type: none; padding: 0;">
      ${itemsListHtml}
    </ul>

    <h3 style="color: #333; margin-bottom: 10px;">Price Summary</h3>
    <p style="font-size: 16px;">Total for items (without delivery fee): <strong>${formattedSubtotalAmount}</strong></p>
    <p style="font-size: 16px;">Delivery Fee: <strong>${formattedDeliveryFee}</strong></p>
    <p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 10px;">Total after adding delivery fee: <strong>${formattedFinalTotalAmount}</strong></p>
    
    ${
      promoCode
        ? `<p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 10px;">Promo Code: ${promoCode}</p>`
        : `<p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 10px;">Promo Code: None</p>`
    }

    ${giftNoteHtml}

    ${commentsHtml}

    ${shippingAddressHtml}
    
  </div>
`;

        const mailOptionsCustomer = {
          from: process.env.MAIL_USERNAME,
          to: customerEmail,
          subject: `Order Confirmation - ${orderNumber}`,
          html: customerEmailHtml,
          attachments: validAttachments,
        };

        transporter.sendMail(mailOptionsCustomer, (error, info) => {
          if (error) {
            console.error("Error sending email to customer:", error);
          }
        });

        const mailOptionsAdmin = {
          from: process.env.MAIL_USERNAME,
          to: process.env.PERSONAL_EMAIL,
          subject: `New Order from ${customerEmail} - ${orderNumber}`,
          html: adminEmailHtml,
          attachments: validAttachments,
        };

        transporter.sendMail(mailOptionsAdmin, (error, info) => {
          if (error) {
            console.error("Error sending email to admin:", error);
          }

          validAttachments.forEach((attachment) => {
            fs.unlink(attachment.path, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          });
        });

        const s3KeysToDelete = lineItems.data
          .map((item) => {
            const logoUrl = item.price.product.metadata?.logoUrl;
            if (logoUrl) {
              const key = logoUrl.split("/").pop();
              return { Key: key };
            }
            return null;
          })
          .filter(Boolean);

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
