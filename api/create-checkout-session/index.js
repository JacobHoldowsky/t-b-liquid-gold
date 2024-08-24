const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.json());

app.post('/api/create-checkout-session', async (req, res) => {
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
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/canceled`,
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
