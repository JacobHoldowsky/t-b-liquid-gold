const Stripe = require("stripe");
const {
  getProducts,
  getDeliveries,
  getPromos,
} = require("../lib/productCatalog");

let stripe;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured on this server");
  }

  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15",
    });
  }

  return stripe;
}

const CUSTOM_LOGO_PRODUCT_ID = "__custom_logo__";
const CUSTOM_LOGO_US_CENTS = 5000;
const CUSTOM_LOGO_IL_CENTS = 17500;

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const stripeClient = getStripe();
      const {
        items,
        giftNote,
        comments,
        shippingDetails,
        deliveryCharge,
        selectedDeliveryOption,
        isSponsorHoneyBoardInCart,
        promoCode,
        currency,
        exchangeRate,
        specialDeliveryOnly,
        isInstitution,
        institutionName,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No items found in the request");
      }

      const currencyCode = currency === "Dollar" ? "usd" : "ils";
      const [products, deliveries, promos] = await Promise.all([
        getProducts(),
        getDeliveries(),
        getPromos(),
      ]);
      const productsById = new Map(
        products.map((product) => [product.productId, product])
      );

      // Rebuild product line items from the Google Sheet. The browser may send
      // product IDs and quantities, but its prices are intentionally ignored.
      const catalogLineItems = items.map((item) => {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error("Invalid item quantity");
        }

        if (item.productId === CUSTOM_LOGO_PRODUCT_ID) {
          return {
            price_data: {
              currency: currencyCode,
              product_data: { name: "Custom Logo Charge" },
              unit_amount:
                currencyCode === "usd"
                  ? CUSTOM_LOGO_US_CENTS
                  : CUSTOM_LOGO_IL_CENTS,
            },
            quantity,
          };
        }

        const product = productsById.get(item.productId);
        if (!product) {
          throw new Error("Product is unavailable");
        }

        const isAvailable =
          currencyCode === "usd" ? product.stockUS : product.stockIL;
        if (isAvailable === false) {
          throw new Error(`${product.itemName} is sold out`);
        }

        const price = currencyCode === "usd" ? product.priceUS : product.priceIL;
        if (!Number.isFinite(price) || price < 0) {
          throw new Error(`${product.itemName} has no valid price`);
        }

        const flavors = item.product_data?.metadata?.flavors || "";
        const productName = flavors
          ? `${product.itemName} (${flavors})`
          : product.itemName;

        return {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: productName,
              metadata: {
                logoUrl: item.product_data?.metadata?.logoUrl || null,
                flavors,
              },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity,
        };
      });

      // Calculate subtotal for items only, excluding delivery charge.
      const subtotal = catalogLineItems.reduce((total, item) => {
        return total + item.price_data.unit_amount * item.quantity;
      }, 0);

      const activePromo = promoCode
        ? promos.find(
            (promo) =>
              promo.active &&
              promo.code.toLowerCase() === String(promoCode).trim().toLowerCase()
          )
        : null;

      if (promoCode && !activePromo) {
        throw new Error("That promo code is not active");
      }

      const discountPercent = activePromo?.discountPercent || 0;
      if (discountPercent < 0 || discountPercent > 100) {
        throw new Error("Promo configuration is invalid");
      }
      const discountRate = discountPercent / 100;

      // Calculate the total discount amount
      const discountAmount = Math.round(subtotal * discountRate);

      // Apply the discount manually to each item price proportionally
      const adjustedItems = catalogLineItems.map((item) => {
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
                ...(comments && { comments: comments }),
              },
            },
            unit_amount: adjustedUnitAmount, // Adjusted price per unit
          },
          quantity: item.quantity,
        };
      });

      // Create line items for Stripe
      const lineItems = adjustedItems;

      // Rebuild delivery from the live sheet. The browser's deliveryCharge and
      // label are display-only and are intentionally ignored here.
      if (
        selectedDeliveryOption &&
        !(isSponsorHoneyBoardInCart && items.length === 1)
      ) {
        const expectedRegion = currency === "Dollar" ? "US" : "Israel";
        const delivery = deliveries.find(
          (option) =>
            option.active &&
            option.deliveryId === selectedDeliveryOption &&
            String(option.region).toLowerCase() === expectedRegion.toLowerCase()
        );

        if (!delivery) {
          throw new Error("That delivery option is no longer available");
        }
        if (delivery.whatsappOnly) {
          throw new Error("Please contact us on WhatsApp for this delivery location");
        }

        const deliveryPrice =
          currency === "Dollar" ? delivery.priceUS : delivery.priceIL;
        if (!Number.isFinite(deliveryPrice) || deliveryPrice < 0) {
          throw new Error("That delivery option has no valid price");
        }

        lineItems.push({
          price_data: {
            currency: currencyCode,
            product_data: {
              name: `Delivery Charge - ${delivery.label}`,
              metadata: {
                note: "Delivery charge is not discounted",
                deliveryId: delivery.deliveryId,
              },
            },
            unit_amount: Math.round(deliveryPrice * 100),
          },
          quantity: 1,
        });
      }

      // if (isSponsorHoneyBoardInCart) {
      //   const sponsorHoneyBoardItems = items.filter(
      //     (item) =>
      //       item.price_data.product_data.name === "Sponsor a Honey Board "
      //   );

      //   let sponsorDeliveryFee = 10 * 100; // $10 delivery fee in cents
      //   if (currency !== "Dollar")
      //     sponsorDeliveryFee = sponsorDeliveryFee * exchangeRate;

      //   if (promoCode === "9173") {
      //     sponsorDeliveryFee = 10;
      //   }

      //   lineItems.push({
      //     price_data: {
      //       currency: currency === "Dollar" ? "usd" : "ils", // Set currency as needed, assuming USD here
      //       product_data: {
      //         name: `Delivery Charge - Sponsor a Honey Board Flat Rate`,
      //         metadata: {
      //           note: "Delivery charge is not discounted", // Add a note in the metadata
      //         },
      //       },
      //       unit_amount: sponsorDeliveryFee,
      //     },
      //     quantity: sponsorHoneyBoardItems[0].quantity,
      //   });
      // }

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
        metadata: {
          ...(giftNote && { giftNote: giftNote }),
          ...(comments && { comments: comments }),
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
          state: shippingDetails.state,
          zipCode: shippingDetails.zipCode,
          specialDeliveryOnly: specialDeliveryOnly,
          contactNumber: shippingDetails.contactNumber,
          region: shippingDetails.region,
          promoCode: activePromo?.code || "",
          discountInfo: activePromo
            ? `${discountPercent}% discount applied; delivery excluded`
            : "No promo discount applied",
          isInstitution: isInstitution ? "true" : "false",
          institutionName: institutionName || "",
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
