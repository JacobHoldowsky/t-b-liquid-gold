const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { items } = req.body;

      const lineItems = items.map((item) => ({
        price_data: {
          currency: item.price_data.currency,
          product_data: {
            name: item.price_data.product_data.name,
            images: item.price_data.product_data.images,
          },
          unit_amount: item.price_data.unit_amount,
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `https://t-b-liquid-gold.vercel.app//success`,
        cancel_url: `https://t-b-liquid-gold.vercel.app//canceled`,
        shipping_address_collection: {
          allowed_countries: ["US", "IL"], // Specify allowed countries
        },
      });

      res.status(200).json({ id: session.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
