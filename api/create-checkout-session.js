const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
module.exports = async (req, res) => {
  if (req.method === "POST") {
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
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
