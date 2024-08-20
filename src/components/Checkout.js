import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./Checkout.css";

const stripePromise = loadStripe("your-publishable-key-here");

function Checkout({ cart, setCart, removeFromCart }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const session = await stripe.redirectToCheckout({
      lineItems: aggregatedCart.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: [item.url],
          },
          unit_amount: parseInt(item.priceDollar.replace("$", "")) * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      successUrl: window.location.origin + "/success",
      cancelUrl: window.location.origin + "/canceled",
    });

    if (session.error) {
      alert(session.error.message);
    }
  };

  const aggregateCartItems = () => {
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
  };

  const aggregatedCart = aggregateCartItems();

  const calculateTotalPrice = (currency) => {
    return aggregatedCart
      .reduce((total, item) => {
        const price = currency === "usd" ? item.priceDollar : item.priceShekel;
        return total + parseFloat(price.replace(/[^0-9.]/g, "")) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      <div className="cart-items">
        {aggregatedCart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {aggregatedCart.map((item, index) => (
              <li key={index}>
                <img src={item.url} alt={`Cart item ${index + 1}`} />
                <div className="item-details">
                  <p>{item.title}</p>
                  <p>Price: {item.priceDollar} / {item.priceShekel}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="total-price">
        <h3>Total: ${calculateTotalPrice("usd")} / ₪{calculateTotalPrice("ils")}</h3>
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
  );
}

export default Checkout;
