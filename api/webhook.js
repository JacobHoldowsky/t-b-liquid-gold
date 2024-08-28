const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const { buffer } = require("micro");
const https = require("https");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      // Parse raw body
      const rawBody = await buffer(req);
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook received:", event.type);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      console.log("Processing checkout.session.completed event");
      const session = event.data.object;
      const customerEmail = session.customer_details.email;
      const shippingDetails = session.customer_details.address;

      if (!customerEmail) {
        console.error("No customer email provided. Cannot send email.");
        return res.status(200).send();
      }

      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { expand: ["data.price.product"] }
        );

        // Handle attachments for logos
        const attachments = await Promise.all(
          lineItems.data.map(async (item) => {
            const logoUrl = item.price.product.metadata.logoUrl;
            console.log(`Processed Logo URL: ${logoUrl}`);

            if (logoUrl) {
              const fileName = path.basename(logoUrl);
              const filePath = path.join("/tmp", fileName); // Use /tmp for Vercel's file storage

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
          attachments: validAttachments, // Attach the downloaded images
        };

        // Send email to customer
        await transporter.sendMail(mailOptionsCustomer);

        // Send a copy of the order details to your personal email
        const mailOptionsAdmin = {
          from: process.env.MAIL_USERNAME,
          to: process.env.PERSONAL_EMAIL,
          subject: `New Order from ${customerEmail}`,
          html: mailOptionsCustomer.html,
          attachments: validAttachments, // Attach the downloaded images
        };

        await transporter.sendMail(mailOptionsAdmin);

        // Delete downloaded images from /tmp
        validAttachments.forEach((attachment) => {
          fs.unlink(attachment.path, (err) => {
            if (err) console.error("Error deleting file:", err);
            else console.log(`File deleted: ${attachment.path}`);
          });
        });
      } catch (err) {
        console.error("Error retrieving line items or sending email:", err);
        return res.status(500).send(`Server Error: ${err.message}`);
      }
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export const config = {
  api: {
    bodyParser: false, // Disable Vercel's body parsing to use raw body
  },
};
