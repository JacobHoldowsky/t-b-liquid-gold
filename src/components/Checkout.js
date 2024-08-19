import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./Checkout.css";

const stripePromise = loadStripe("your-publishable-key-here");

function Checkout({ cart, setCart }) {
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
          unit_amount: parseInt(item.price.replace("$", "")) * 100,
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
      if (seenTitles[item.title]) {
        // If the item has been seen before, increase the quantity
        const existingItemIndex = seenTitles[item.title];
        aggregatedCart[existingItemIndex].quantity += 1;
      } else {
        // If it's the first time the item is seen, add it to the aggregatedCart
        seenTitles[item.title] = aggregatedCart.length;
        aggregatedCart.push({ ...item, quantity: 1 });
      }
    });

    return aggregatedCart;
  };

  const aggregatedCart = aggregateCartItems();

  const removeItemFromCart = (id) => {
    const updatedCart = [];
    let itemRemoved = false;

    // Rebuild the cart while removing the first occurrence of the item with the given id
    cart.forEach((item) => {
      if (item.id !== id || itemRemoved) {
        updatedCart.push(item);
      } else {
        itemRemoved = true; // Skip the first occurrence of the item with this id
      }
    });

    setCart(updatedCart); // Use setCart to update the cart
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const calculateTotalPrice = () => {
    return aggregatedCart
      .reduce(
        (total, item) =>
          total + parseFloat(item.price.replace("$", "")) * item.quantity,
        0
      )
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
                  <p>Price: {item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <button onClick={() => removeItemFromCart(item.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="total-price">
        <h3>Total: ${calculateTotalPrice()}</h3>
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
