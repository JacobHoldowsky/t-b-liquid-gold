import React, { useMemo, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./Checkout.css";
import { CurrencyContext } from "../context/CurrencyContext";

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

function Checkout({ cart, setCart, removeFromCart }) {
  const { currency } = useContext(CurrencyContext);

  const aggregatedCart = useMemo(() => {
    const aggregatedCart = [];
    const seenTitles = {};

    cart.forEach((item) => {
      const itemQuantity = item.quantity ? parseInt(item.quantity, 10) : 1;

      if (seenTitles[item.title]) {
        const existingItemIndex = seenTitles[item.title];
        aggregatedCart[existingItemIndex].quantity += itemQuantity;
      } else {
        seenTitles[item.title] = aggregatedCart.length;
        aggregatedCart.push({ ...item, quantity: itemQuantity });
      }
    });

    return aggregatedCart;
  }, [cart]);

  const apiUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api/create-checkout-session"
      : '/api/create-checkout-session';

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: aggregatedCart.map((item) => ({
            price_data: {
              currency: currency === "Dollar" ? "usd" : "ils",
              product_data: {
                name: item.title,
                images: [item.url],
              },
              unit_amount:
                (currency === "Dollar" ? item.priceDollar : item.priceShekel) *
                100,
            },
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorDetails}`
        );
      }

      const session = await response.json();
      console.log(session); // Debugging line

      if (!session.id) {
        throw new Error("No session ID returned from the API");
      }

      // Redirect to Stripe Checkout using the session ID
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Clear the cart if the payment is successful
      setCart([]);
      localStorage.removeItem("cart"); // Also clear the cart in localStorage
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
        return total + parseFloat(price) * item.quantity;
      }, 0)
      .toFixed(2);

    return formatNumberWithCommas(parseFloat(total));
  };

  const updateItemQuantity = (itemTitle, newQuantity) => {
    if (newQuantity === 0) {
      const confirmRemoval = window.confirm(
        "Do you want to remove this item from your cart?"
      );
      if (confirmRemoval) {
        const itemToRemove = cart.find((item) => item.title === itemTitle);
        removeFromCart(itemToRemove.id);
      }
    } else {
      const updatedCart = cart.map((item) => {
        if (item.title === itemTitle) {
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
                  <img src={item.url} alt={`Cart item ${index + 1}`} />
                  <div className="item-details">
                    <p className="item-title">{item.title}</p>
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
                          item.title,
                          Math.max(0, item.quantity - 1)
                        )
                      }
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="item-quantity">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateItemQuantity(item.title, item.quantity + 1)
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
