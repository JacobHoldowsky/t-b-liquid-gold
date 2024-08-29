// create-checkout-session.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const {
        items,
        giftNote,
        shippingDetails,
        deliveryCharge,
        selectedDeliveryOption,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No items found in the request");
      }

      const lineItems = [];
      const logoChargedProducts = new Set(); // Track product types that should be charged for logos

      items.forEach((item) => {
        const logoUrl = item.price_data?.product_data?.metadata?.logoUrl;
        const productName = item.price_data?.product_data?.name;

        console.log("logoUrl", logoUrl);

        // Add the main item to line items
        lineItems.push({
          price_data: {
            currency: item.price_data.currency,
            product_data: {
              name: productName,
              metadata: {
                logoUrl: logoUrl || null,
                ...(giftNote && { giftNote: giftNote }),
              },
            },
            unit_amount: item.price_data.unit_amount,
          },
          quantity: item.quantity,
        });

        // Add a single logo charge for each unique product type that includes a logo
        if (logoUrl && !logoChargedProducts.has(productName)) {
          logoChargedProducts.add(productName); // Add the product type to the set to avoid duplicate charges
          lineItems.push({
            price_data: {
              currency: "usd", // Assuming the charge should always be in USD
              product_data: {
                name: `Custom Logo for ${productName}`, // Label the logo charge with the product name
              },
              unit_amount: 5000, // $50 charge in cents
            },
            quantity: 1, // One-time charge per product type
          });
        }
      });

      // Add delivery charge as a line item if applicable
      if (selectedDeliveryOption && deliveryCharge > 0) {
        lineItems.push({
          price_data: {
            currency: "usd", // Set currency as needed, assuming USD here
            product_data: {
              name: `Delivery Charge - ${selectedDeliveryOption}`,
            },
            unit_amount: deliveryCharge * 100, // Convert to cents
          },
          quantity: 1,
        });
      }

      // Remove any unintended extra "Custom Logo Charge" line items
      const finalLineItems = lineItems.filter((item) => {
        // Check for unintended "Custom Logo Charge" that doesn't match specific product types
        const isExtraLogoCharge =
          item.price_data.product_data.name === "Custom Logo Charge";
        return !isExtraLogoCharge;
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: finalLineItems,
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
        metadata: {
          ...(giftNote && { giftNote: giftNote }), // Include the gift note in the session metadata if it exists
          fullName: shippingDetails.fullName, // Include additional customer information
          email: shippingDetails.email,
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
          contactNumber: shippingDetails.contactNumber,
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
