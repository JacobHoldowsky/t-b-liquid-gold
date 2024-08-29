const Stripe = require("stripe");
const nodemailer = require("nodemailer");
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
      const giftNote = session.metadata.giftNote || ""; // Retrieve gift note from session metadata

      // Retrieve shipping details and other metadata
      const fullName = session.metadata.fullName || "";
      const recipientName = session.metadata.recipientName || "";
      const address = session.metadata.address || "";
      const homeType = session.metadata.homeType || "";
      const apartmentNumber = session.metadata.apartmentNumber || "";
      const floor = session.metadata.floor || "";
      const code = session.metadata.code || "";
      const city = session.metadata.city || "";
      const zipCode = session.metadata.zipCode || "";
      const contactNumber = session.metadata.contactNumber || "";

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
            <p>${address}</p>
            ${apartmentNumber ? `<p>Apt: ${apartmentNumber}</p>` : ""}
            ${floor ? `<p>Floor: ${floor}</p>` : ""}
            ${code ? `<p>Building Code: ${code}</p>` : ""}
            <p>${city}, ${zipCode}</p>
          `;

        // Include the gift note in the email if it exists
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
  
              <h3 style="color: #333; margin-top: 20px;">Shipping Information</h3>
              <p><strong>Recipient Name:</strong> ${recipientName}</p>
              <div style="font-size: 16px;">
                ${shippingAddressHtml}
              </div>
              
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
  
              <h3 style="color: #333; margin-top: 20px;">Shipping Information</h3>
              <p><strong>Recipient Name:</strong> ${recipientName}</p>
              <div style="font-size: 16px;">
                ${shippingAddressHtml}
              </div>
              
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
        await transporter.sendMail(mailOptionsCustomer);

        // Mail Options for Admin
        const mailOptionsAdmin = {
          from: process.env.MAIL_USERNAME,
          to: process.env.PERSONAL_EMAIL,
          subject: `New Order from ${customerEmail}`,
          html: adminEmailHtml,
          attachments: validAttachments,
        };

        // Send email to admin
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
