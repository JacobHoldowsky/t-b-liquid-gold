import React, { useMemo, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./Checkout.css";
import { CurrencyContext } from "../context/CurrencyContext"; // Import CurrencyContext

const stripePromise = loadStripe("your-publishable-key-here");

function Checkout({ cart, setCart, removeFromCart }) {
  const { currency } = useContext(CurrencyContext); // Use context here

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

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      const session = await stripe.redirectToCheckout({
        lineItems: aggregatedCart.map((item) => ({
          price_data: {
            currency: currency === "Dollar" ? "usd" : "ils",
            product_data: {
              name: item.title,
              images: [item.url],
            },
            unit_amount: parseInt(
              (currency === "Dollar"
                ? item.priceDollar.replace("$", "")
                : item.priceShekel.replace("₪", "")
              ).replace(/[^0-9.]/g, "")
            ) * 100,
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/canceled`,
      });

      if (session.error) {
        throw new Error(session.error.message);
      }
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
          total +
          parseFloat(price.replace(/[^0-9.]/g, "")) * item.quantity
        );
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
                            parseFloat(item.priceDollar.replace(/[^0-9.]/g, ""))
                          )}`
                        : `₪${formatNumberWithCommas(
                            parseFloat(item.priceShekel.replace(/[^0-9.]/g, ""))
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
          <h3>Total: {currency === "Dollar" ? "$" : "₪"}{calculateTotalPrice()}</h3>
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
