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
        isSponsorHoneyBoardInCart,
        promoCode,
        currency,
        exchangeRate,
        specialDeliveryOnly,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No items found in the request");
      }

      // Calculate subtotal for items only, excluding delivery charge
      const subtotal = items.reduce((total, item) => {
        return total + item.price_data.unit_amount * item.quantity;
      }, 0);

      // Check if a valid promo code is entered and calculate the discount
      let discountRate = 0;
      if (promoCode.includes("5")) {
        discountRate = 0.05; // 5% discount
      }

      if (promoCode === "9173") {
        discountRate = 0.99; // 5% discount
      }

      // Calculate the total discount amount
      const discountAmount = Math.round(subtotal * discountRate);

      // Apply the discount manually to each item price proportionally
      const adjustedItems = items.map((item) => {
        // Calculate discount for each item proportionally
        const itemDiscount = Math.round(
          item.price_data.unit_amount * discountRate
        );
        const adjustedUnitAmount = item.price_data.unit_amount - itemDiscount;

        // Ensure adjustedUnitAmount is non-negative and an integer
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
            unit_amount: adjustedUnitAmount, // Adjusted price per unit
          },
          quantity: item.quantity,
        };
      });

      // Create line items for Stripe
      const lineItems = adjustedItems;

      // Add delivery charge as a separate line item (not discounted)
      if (
        selectedDeliveryOption &&
        deliveryCharge > 0 &&
        selectedDeliveryOption !== "Sponsor a Honey Board Flat Rate" &&
        !(isSponsorHoneyBoardInCart && items.length === 1)
      ) {
        lineItems.push({
          price_data: {
            currency: currency === "Dollar" ? "usd" : "ils", // Set currency as needed, assuming USD here
            product_data: {
              name: `Delivery Charge - ${selectedDeliveryOption}`,
              metadata: {
                note: "Delivery charge is not discounted", // Add a note in the metadata
              },
            },
            unit_amount: deliveryCharge * 100, // Convert to cents
          },
          quantity: 1,
        });
      }

      if (isSponsorHoneyBoardInCart) {
        const sponsorHoneyBoardItems = items.filter(
          (item) =>
            item.price_data.product_data.name === "Sponsor a Honey Board "
        );

        let sponsorDeliveryFee = 10 * 100; // $10 delivery fee in cents
      if (currency !== "Dollar")
        sponsorDeliveryFee = sponsorDeliveryFee * exchangeRate;

      if (promoCode === '9173' && currency === 'Dollar') {
        sponsorDeliveryFee = 100
      }
      if (promoCode === '9173' && currency !== 'Dollar') {
        sponsorDeliveryFee = 100 * exchangeRate
      }

        lineItems.push({
          price_data: {
            currency: currency === "Dollar" ? "usd" : "ils", // Set currency as needed, assuming USD here
            product_data: {
              name: `Delivery Charge - Sponsor a Honey Board Flat Rate`,
              metadata: {
                note: "Delivery charge is not discounted", // Add a note in the metadata
              },
            },
            unit_amount: sponsorDeliveryFee,
          },
          quantity: sponsorHoneyBoardItems[0].quantity,
        });
      }

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
          specialDeliveryOnly: specialDeliveryOnly,
          contactNumber: shippingDetails.contactNumber,
          promoCode: promoCode || "", // Include promo code in the metadata
          discountInfo:
            "5% discount applied to subtotal only, excluding delivery charge",
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
