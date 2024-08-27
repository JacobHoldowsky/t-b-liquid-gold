import React, { useMemo, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./Checkout.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function Checkout({ cart, setCart, removeFromCart }) {
  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);

  const aggregatedCart = useMemo(() => {
    const aggregatedCart = [];
    const seenTitles = {};

    cart.forEach((item) => {
      const itemQuantity = item.quantity ? parseInt(item.quantity, 10) : 1;
      const flavors = item.selectedFlavors ? item.selectedFlavors : [];
      const key = flavors.length
        ? `${item.title}-${flavors.join(",")}-${item.includeLogo ? "Logo" : ""}`
        : item.title;

      if (seenTitles[key]) {
        const existingItemIndex = seenTitles[key];
        aggregatedCart[existingItemIndex].quantity += itemQuantity;
      } else {
        seenTitles[key] = aggregatedCart.length;
        aggregatedCart.push({
          ...item,
          quantity: itemQuantity,
          selectedFlavors: flavors,
        });
      }
    });

    return aggregatedCart;
  }, [cart]);

  const apiUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api/create-checkout-session"
      : "/api/create-checkout-session";

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      let logoSurchargeAdded = false; // Track if the logo surcharge has been added

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: aggregatedCart.flatMap((item) => {
            const flavorText = item.selectedFlavors?.length
              ? ` (${item.selectedFlavors.join(", ")})`
              : "";
            const logoText = item.includeLogo ? " with Logo" : "";

            // Calculate base unit amount
            const basePrice =
              currency === "Dollar" ? item.priceDollar : item.priceShekel;

            // Add logo surcharge only once, regardless of quantity
            let items = [
              {
                price_data: {
                  currency: currency === "Dollar" ? "usd" : "ils",
                  product_data: {
                    name: `${item.title}${flavorText}${logoText}`,
                    images: [item.url],
                  },
                  unit_amount: basePrice * 100,
                },
                quantity: item.quantity,
              },
            ];

            if (item.includeLogo && !logoSurchargeAdded) {
              logoSurchargeAdded = true;

              // Add a separate item for the logo surcharge
              const logoCharge =
                currency === "Dollar" ? 50 : Math.ceil(50 * exchangeRate);

              items.push({
                price_data: {
                  currency: currency === "Dollar" ? "usd" : "ils",
                  product_data: {
                    name: "Personalized Logo",
                  },
                  unit_amount: logoCharge * 100,
                },
                quantity: 1,
              });
            }

            return items;
          }),
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorDetails}`
        );
      }

      const session = await response.json();
      console.log(session);

      if (!session.id) {
        throw new Error("No session ID returned from the API");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setCart([]);
      localStorage.removeItem("cart");
    } catch (error) {
      alert(`Checkout failed: ${error.message}`);
    }
  };

  const formatNumberWithCommas = (number) => {
    return number.toLocaleString();
  };

  const calculateTotalPrice = () => {
    const total = aggregatedCart
      .reduce((total, item) => {
        const price =
          currency === "Dollar" ? item.priceDollar : item.priceShekel;
        return (
          total + parseFloat(price) * item.quantity + (item.logoCharge || 0)
        );
      }, 0)
      .toFixed(2);

    return formatNumberWithCommas(parseFloat(total));
  };

  const updateItemQuantity = (itemKey, newQuantity) => {
    const itemToUpdate = cart.find(
      (item) =>
        (item.selectedFlavors?.length
          ? `${item.title}-${item.selectedFlavors.join(",")}`
          : item.title) === itemKey
    );

    // Special handling for "Mini Collection Board"
    if (itemToUpdate.title === "Mini Collection Board" && newQuantity < 15) {
      const confirmRemoval = window.confirm(
        "The minimum quantity for Mini Collection Board is 15. Would you like to remove them all from your cart?"
      );
      if (confirmRemoval) {
        const updatedCart = cart.filter(
          (item) => item.title !== "Mini Collection Board"
        );
        setCart(updatedCart);
        return; // Exit function to prevent further processing
      }
      return; // Exit function to prevent further processing if not removing
    }

    // If quantity is 1 and is being reduced, trigger removal confirmation
    if (newQuantity <= 0) {
      const confirmRemoval = window.confirm(
        "Do you want to remove this item from your cart?"
      );
      if (confirmRemoval) {
        removeFromCart(itemToUpdate.id);
      }
    } else {
      // Update the quantity for items that can be reduced to zero
      const updatedCart = cart.map((item) => {
        if (
          (item.selectedFlavors?.length
            ? `${item.title}-${item.selectedFlavors.join(",")}`
            : item.title) === itemKey
        ) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      setCart(updatedCart);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout">
        <h2>Checkout</h2>
        <div className="cart-items">
          {aggregatedCart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul>
              {aggregatedCart.map((item, index) => (
                <li key={index} className="cart-item">
                  <img
                    src={item.imageUrl || item.url}
                    alt={`Cart item ${index + 1}`}
                  />
                  <div className="item-details">
                    <p className="item-title">{item.title}</p>
                    {item.selectedFlavors?.length ? (
                      <p className="item-flavors">
                        Flavors: {item.selectedFlavors.join(", ")}
                      </p>
                    ) : null}
                    {item.includeLogo && (
                      <p className="item-logo">
                        Personalized Logo (
                        {currency === "Dollar"
                          ? `$50`
                          : `₪${50 * exchangeRate}`}
                        )
                      </p>
                    )}
                    <p className="item-price">
                      {currency === "Dollar"
                        ? `$${formatNumberWithCommas(
                            parseFloat(item.priceDollar)
                          )}`
                        : `₪${formatNumberWithCommas(
                            parseFloat(item.priceShekel)
                          )}`}
                    </p>
                  </div>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateItemQuantity(
                          item.selectedFlavors?.length
                            ? `${item.title}-${item.selectedFlavors.join(",")}`
                            : item.title,
                          item.quantity - 1
                        )
                      }
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="item-quantity">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateItemQuantity(
                          item.selectedFlavors?.length
                            ? `${item.title}-${item.selectedFlavors.join(",")}`
                            : item.title,
                          item.quantity + 1
                        )
                      }
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="total-price">
          <h3>
            Total: {currency === "Dollar" ? "$" : "₪"}
            {calculateTotalPrice()}
          </h3>
        </div>
        <button
          type="button"
          className="submit-order-btn"
          disabled={aggregatedCart.length === 0}
          onClick={handleCheckout}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

export default Checkout;
