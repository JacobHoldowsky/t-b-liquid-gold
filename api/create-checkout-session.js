// create-checkout-session.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { items, giftNote } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No items found in the request");
      }

      let hasLogoCharge = false;

      // Map items and check if any item has a custom logo
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

      // Create the Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
        shipping_address_collection: {
          allowed_countries: ["US", "IL"], // Specify the allowed shipping countries
        },
        metadata: {
          ...(giftNote && { giftNote: giftNote }), // Include the gift note in the session metadata if it exists
        },
      });

      // Respond with the session ID
      res.status(200).json({ id: session.id });
    } catch (err) {
      console.error("Error creating checkout session:", err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    // Respond with 405 if the method is not POST
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
