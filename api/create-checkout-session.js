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
        promoCode,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No items found in the request");
      }

      // Calculate subtotal for items only, excluding delivery charge
      const itemSubtotal = items.reduce((total, item) => {
        return total + item.price_data.unit_amount * item.quantity;
      }, 0);

      // Calculate logo charges and track product types
      const logoChargedProducts = new Set(); // Track product types for logo charges
      const lineItems = [];
      let totalLogoCharge = 0;

      items.forEach((item) => {
        const logoUrl = item.price_data?.product_data?.metadata?.logoUrl;
        const flavors = item.price_data.product_data.metadata?.flavors || "";
        const productName =
          item.price_data.product_data.name + (flavors ? ` (${flavors})` : "");

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
          logoChargedProducts.add(productName); // Avoid duplicate logo charges
          totalLogoCharge += 5000; // $50 charge in cents
        }
      });

      // Apply the promo code discount
      let discountRate = 0;
      if (promoCode === "SAVE5") {
        discountRate = 0.05; // 5% discount
      }

      // Calculate subtotal including logo charges
      const subtotalWithLogo = itemSubtotal + totalLogoCharge;
      const discountAmount = Math.round(subtotalWithLogo * discountRate);

      // Adjust item prices based on the discount
      const adjustedItems = items.map((item) => {
        const itemDiscount = Math.round(
          item.price_data.unit_amount * discountRate
        );
        const adjustedUnitAmount = item.price_data.unit_amount - itemDiscount;

        return {
          price_data: {
            currency: item.price_data.currency,
            product_data: {
              name: item.price_data.product_data.name,
              metadata: {
                logoUrl: item.price_data.product_data.metadata?.logoUrl || null,
                flavors: item.price_data.product_data.metadata?.flavors || "",
                ...(giftNote && { giftNote: giftNote }),
              },
            },
            unit_amount: adjustedUnitAmount,
          },
          quantity: item.quantity,
        };
      });

      // Add adjusted items to line items
      lineItems.push(...adjustedItems);

      // Add delivery charge as a line item if applicable
      if (selectedDeliveryOption && deliveryCharge > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Delivery Charge - ${selectedDeliveryOption}`,
              metadata: {
                note: "Delivery charge is not discounted",
              },
            },
            unit_amount: deliveryCharge * 100, // Convert to cents
          },
          quantity: 1,
        });
      }

      // Create the Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
        metadata: {
          ...(giftNote && { giftNote: giftNote }),
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
          zipCode: shippingDetails.zipCode,
          contactNumber: shippingDetails.contactNumber,
          promoCode: promoCode || "",
          discountInfo:
            "5% discount applied to subtotal including logo charges, excluding delivery charge",
        },
      });

      res.status(200).json({ id: session.id });
    } catch (err) {
      console.error("Error creating checkout session:", err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
