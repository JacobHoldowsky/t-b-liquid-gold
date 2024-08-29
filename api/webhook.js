const Stripe = require("stripe");
const nodemailer = require("nodemailer");

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
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook received:", event.type);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details.email;
      const shippingDetails = session.customer_details.address;

      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );
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
              
              <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">Thank you for shopping with us!</p>
            </div>
          `,
        };

        transporter.sendMail(mailOptionsCustomer, (error, info) => {
          if (error) {
            console.error("Error sending email to customer:", error);
          } else {
            console.log("Email sent to customer:", info.response);
          }
        });

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

              <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">Customer Email: ${customerEmail}</p>
            </div>
          `,
        };

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

    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
