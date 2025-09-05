const Stripe = require("stripe");
const { Resend } = require('resend');
const https = require("https");
const fs = require("fs");
const path = require("path");
const { buffer } = require("micro");
const crypto = require("crypto"); // Import crypto for generating random strings

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const sig = req.headers["stripe-signature"];
    let event;
    let lineItems;

    try {
      // Parse raw body for Stripe webhook signature verification
      const rawBody = await buffer(req);
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details.email;
      const giftNote = session.metadata.giftNote || ""; // Retrieve gift note from session metadata
      const comments = session.metadata.comments || ""; // Retrieve gift note from session metadata
      const fullName = session.metadata.fullName;
      const email = session.metadata.email;
      const number = session.metadata.number;
      const recipientName = session.metadata.recipientName;
      const address = session.metadata.address;
      const homeType = session.metadata.homeType;
      let apartmentNumber = "";
      let floor = "";
      let code = "";

      if (homeType === "building") {
        apartmentNumber = session.metadata.apartmentNumber;
        floor = session.metadata.floor;
        code = session.metadata.code;
      }

      const city = session.metadata.city;
      const state = session.metadata.state;
      const zipCode = session.metadata.zipCode;
      const contactNumber = session.metadata.contactNumber;
      const promoCode = session.metadata.promoCode;
      let specialDeliveryOnly = session.metadata.specialDeliveryOnly;
      const isInstitution = session.metadata.isInstitution === "true";
      const institutionName = session.metadata.institutionName;

      if (!customerEmail) {
        console.error("No customer email provided. Cannot send email.");
        return res.status(200).send();
      }

      try {
        lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ["data.price.product"],
        });

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
              const filePath = path.join("/tmp", fileName); // Use /tmp for storage

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
                      fs.unlink(filePath, () => { }); // Delete the file on error
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
                <strong>${item.quantity}x ${item.description}${isCustomLogoCharge ? " (see attachment)" : ""
              }</strong><br>
                <span style="color: #777;">Price: ${item.currency.toUpperCase() === "USD" ? "$" : "₪"
              }${(item.amount_total / 100).toFixed(2)}</span>
              </li>
            `;
          })
          .join("");

        const capitalizedHomeType =
          homeType.charAt(0).toUpperCase() + homeType.slice(1);

        /// HTML for Shipping Address
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
${recipientName
              ? `<h3 style="color: #333; margin-top: 20px;">Delivery Information</h3>`
              : ""
            }
${recipientName
              ? `<p><strong>Recipient Name:</strong> ${recipientName}</p>`
              : ""
            }
${address ? `<p><strong>Address:</strong> ${address}</p>` : ""}


${homeType ? `<p><strong>Home Type:</strong> ${capitalizedHomeType}</p>` : ""}
${homeType === "building"
              ? `<p><strong>Apartment Number:</strong> ${apartmentNumber}</p>
       <p><strong>Floor:</strong> ${floor}</p>
       <p><strong>Building Code:</strong> ${code}</p>`
              : ""
            }
 ${city ? `<p><strong>City:</strong> ${city}</p>` : ""}  ${state
              ? `<p>
      <strong>State:</strong> ${state}
    </p>`
              : ""
            }
  ${zipCode ? `<p><strong>Zip Code:</strong> ${zipCode}</p>` : ""}
  ${contactNumber
              ? `<p><strong>Recipient Contact Number:</strong> ${contactNumber}</p>`
              : ""
            }`;

        // Gift Note HTML
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
    
    ${isInstitution ? `
    <h3 style="color: #333; margin-top: 20px;">Institution Details</h3>
    <p><strong>Institution Name:</strong> ${institutionName}</p>
    <p style="color: #e74c3c;"><strong>Note:</strong> If the student is unreachable, packages are delivered to the school's office/reception/guard or given to a fellow student. We do not accept responsibility once the package has been delivered to the institution.</p>
    ` : ''}
    
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
    
    ${promoCode
            ? `<p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 10px;">Promo Code: ${promoCode}</p>`
            : `<p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 10px;">Promo Code: None</p>`
          }

    ${giftNoteHtml}

    ${commentsHtml}

    ${shippingAddressHtml}
    
    ${isInstitution ? `
    <h3 style="color: #333; margin-top: 20px;">Institution Details</h3>
    <p><strong>Institution Name:</strong> ${institutionName}</p>
    ` : ''}

  </div>
`;
  
        console.log("email: ", email);
        console.log("customerEmail: ", customerEmail);

        try {
          // Send email to customer using Resend
          await resend.emails.send({
            from: 'contact@uxilitypro.com', // Update this with your verified domain
            to: customerEmail,
            subject: `Order Confirmation - ${orderNumber}`,
            html: customerEmailHtml,
            attachments: validAttachments,
          });

          // Send email to admin using Resend
          await resend.emails.send({
            from: 'contact@uxilitypro.com', // Update this with your verified domain
            to: process.env.PERSONAL_EMAIL,
            subject: `New Order from ${customerEmail} - ${orderNumber}`,
            html: adminEmailHtml,
            attachments: validAttachments,
          });

          // Delete downloaded images from /tmp
          validAttachments.forEach((attachment) => {
            fs.unlink(attachment.path, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          });
        } catch (emailError) {
          console.error("Error sending emails via Resend:", emailError);
          // Don't return here, as we still want to acknowledge the webhook
        }
      } catch (err) {
        console.error("Error retrieving line items:", err);
        // Don't return here, as we still want to acknowledge the webhook
      }
    }

    try {
      const files = await fs.readdir("/tmp"); // List all files in /tmp
      for (const file of files) {
        await fs.unlink(path.join("/tmp", file)); // Delete each file
      }
    } catch (err) {
      console.error("Error cleaning up /tmp directory:", err);
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
