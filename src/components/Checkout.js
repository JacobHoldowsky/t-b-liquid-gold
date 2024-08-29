import React, { useMemo, useContext, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./Checkout.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const DELIVERY_OPTIONS = [
  {
    label: "Pick up in Ramat Eshkol",
    charge: 0,
  },
  {
    label:
      "Ramat Eshkol, Maalot Dafna, Arzei Habira, French Hill, Sanhedria, Givat Hamivtar",
    charge: 10,
  },
  { label: "Anywhere in Jerusalem and Bet Shemesh/RBS", charge: 15 },
  {
    label:
      "Givat Zev, Modiin, Mevaseret, Beitar, Mitzpei Yericho, Maaleh Adumim",
    charge: 20,
  },
  {
    label:
      "All other locations in Israel (order deadline for this delivery option is September 22)",
    charge: 25,
    deadline: "2024-09-23",
  },
];

function Checkout({ cart, setCart, removeFromCart }) {
  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    email: "",
    number: "",
    recipientName: "",
    address: "",
    homeType: "",
    apartmentNumber: "",
    floor: "",
    code: "",
    city: "",
    zipCode: "",
    contactNumber: "",
  });
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [promoCode, setPromoCode] = useState(""); // State for promo code input
  const [isPromoApplied, setIsPromoApplied] = useState(false); // State to track if promo is applied
  const [promoMessage, setPromoMessage] = useState({ message: "", type: "" }); // State for promo feedback

  // Aggregate cart items and calculate unique logo charges
  const aggregatedCart = useMemo(() => {
    const aggregatedCart = [];
    const seenTitles = {};
    const uniqueLogoItems = new Set();

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

      // Track unique items with logos
      if (item.includeLogo) {
        uniqueLogoItems.add(item.title);
      }
    });

    return { aggregatedCart, uniqueLogoCount: uniqueLogoItems.size };
  }, [cart]);

  const apiUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api/create-checkout-session"
      : "/api/create-checkout-session";

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      // Calculate logo charges
      const logoChargePerType =
        currency === "Dollar" ? 5000 : Math.ceil(50 * exchangeRate * 100); // $50 in cents or equivalent
      const totalLogoCharge =
        aggregatedCart.uniqueLogoCount * logoChargePerType;

      // Prepare items for checkout session
      const lineItems = aggregatedCart.aggregatedCart.map((item) => {
        const basePrice =
          currency === "Dollar" ? item.priceDollar : item.priceShekel;

        return {
          price_data: {
            currency: currency === "Dollar" ? "usd" : "ils",
            product_data: {
              name: `${item.title}`,
              metadata: {
                logoUrl: item.logoUrl ? item.logoUrl : null,
                flavors: item.selectedFlavors
                  ? item.selectedFlavors.join(", ")
                  : "",
              },
            },
            unit_amount: basePrice * 100,
          },
          quantity: item.quantity,
        };
      });

      // Include custom logo charges as a single line item if applicable
      if (aggregatedCart.uniqueLogoCount > 0) {
        lineItems.push({
          price_data: {
            currency: currency === "Dollar" ? "usd" : "ils",
            product_data: {
              name: "Custom Logo Charge",
            },
            unit_amount: logoChargePerType,
          },
          quantity: aggregatedCart.uniqueLogoCount,
        });
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: lineItems,
          gift: isGift,
          giftNote: isGift ? giftNote : null,
          shippingDetails,
          deliveryCharge,
          selectedDeliveryOption,
          promoCode: promoCode,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorDetails}`
        );
      }

      const session = await response.json();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleDeliveryOptionChange = (e) => {
    const selectedOption = DELIVERY_OPTIONS[e.target.value];
    if (
      selectedOption.deadline &&
      new Date() > new Date(selectedOption.deadline)
    ) {
      alert("This delivery option is no longer available due to the deadline.");
      setSelectedDeliveryOption(null);
      setDeliveryCharge(0);
      return;
    }
    setSelectedDeliveryOption(selectedOption.label);
    setDeliveryCharge(selectedOption.charge);
  };

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
  };

  const applyPromoCode = () => {
    if (promoCode === "SAVE5") {
      // Example promo code
      setIsPromoApplied(true);
      setPromoMessage({
        message: "Promo code accepted! 5% discount applied.",
        type: "success",
      });
    } else {
      setPromoMessage({
        message: "Invalid promo code. Please try again.",
        type: "error",
      });
      setIsPromoApplied(false);
    }
  };

  const formatNumberWithCommas = (number) => {
    return number.toLocaleString();
  };

  const calculateTotalPrice = () => {
    // Calculate subtotal including logo charges
    const itemSubtotal = aggregatedCart.aggregatedCart.reduce((total, item) => {
      const price = currency === "Dollar" ? item.priceDollar : item.priceShekel;
      return total + parseFloat(price) * item.quantity;
    }, 0);

    // Calculate the logo charge
    const logoChargePerType = currency === "Dollar" ? 50 : 50 * exchangeRate;
    const totalLogoCharge = aggregatedCart.uniqueLogoCount * logoChargePerType;

    // Calculate subtotal including logo charges
    const subtotal = itemSubtotal + totalLogoCharge;

    // Calculate the discount
    const discount = isPromoApplied ? subtotal * 0.05 : 0; // Apply 5% discount

    // Calculate the final total
    const total = subtotal - discount + deliveryCharge;

    // Ensure two decimal places for cents
    return formatNumberWithCommas(total.toFixed(2));
  };

  const updateItemQuantity = (itemKey, newQuantity) => {
    const itemToUpdate = cart.find(
      (item) =>
        (item.selectedFlavors?.length
          ? `${item.title}-${item.selectedFlavors.join(",")}`
          : item.title) === itemKey
    );

    if (
      itemToUpdate.title === "Mini Four Collection Board" &&
      newQuantity < 5
    ) {
      const confirmRemoval = window.confirm(
        "The minimum quantity for Mini Four Collection Board is 5. Would you like to remove them all from your cart?"
      );
      if (confirmRemoval) {
        const updatedCart = cart.filter(
          (item) => item.title !== "Mini Four Collection Board"
        );
        setCart(updatedCart);
        return;
      }
      return;
    }

    if (itemToUpdate.title === "Mini Six Collection Board" && newQuantity < 5) {
      const confirmRemoval = window.confirm(
        "The minimum quantity for Mini Six Collection Board is 5. Would you like to remove them all from your cart?"
      );
      if (confirmRemoval) {
        const updatedCart = cart.filter(
          (item) => item.title !== "Mini Six Collection Board"
        );
        setCart(updatedCart);
        return;
      }
      return;
    }

    if (newQuantity <= 0) {
      const confirmRemoval = window.confirm(
        "Do you want to remove this item from your cart?"
      );
      if (confirmRemoval) {
        removeFromCart(itemToUpdate.id);
      }
    } else {
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

  // Validation check for the form
  useEffect(() => {
    const areMandatoryFieldsFilled = [
      shippingDetails.fullName,
      shippingDetails.email,
      shippingDetails.number,
      shippingDetails.recipientName,
      shippingDetails.address,
      shippingDetails.homeType,
      shippingDetails.city,
      shippingDetails.zipCode,
      shippingDetails.contactNumber,
    ].every((field) => field.trim() !== "");

    const areBuildingFieldsFilled =
      shippingDetails.homeType === "building"
        ? [
            shippingDetails.apartmentNumber,
            shippingDetails.floor,
            shippingDetails.code,
          ].every((field) => field.trim() !== "")
        : true;

    setIsFormValid(
      areMandatoryFieldsFilled &&
        areBuildingFieldsFilled &&
        selectedDeliveryOption
    );
  }, [shippingDetails, selectedDeliveryOption]);

  return (
    <div className="checkout-container">
      <div className="checkout">
        <h2>Checkout</h2>
        <div className="cart-items">
          {aggregatedCart.aggregatedCart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul>
              {aggregatedCart.aggregatedCart.map((item, index) => (
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
                          ? `+ One time fee of $50`
                          : `+ One time fee of ₪${50 * exchangeRate}`}
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
        {aggregatedCart.aggregatedCart.length ? (
          <div className="promo-code">
            <label htmlFor="promoCode">Promo Code:</label>
            <input
              type="text"
              id="promoCode"
              value={promoCode}
              onChange={handlePromoCodeChange}
              placeholder="Enter promo code"
            />
            <button onClick={applyPromoCode} className="apply-promo-btn">
              Apply
            </button>
            {promoMessage.message && (
              <div className={`promo-message ${promoMessage.type}`}>
                {promoMessage.message}
              </div>
            )}
          </div>
        ) : null}
        {aggregatedCart.aggregatedCart.length ? (
          <div className="gift-option">
            <label>
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
              />
              This is a gift
            </label>
            {isGift && (
              <textarea
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value.slice(0, 400))}
                placeholder="Include a gift note (max 400 characters)"
                rows="4"
                maxLength="400"
              />
            )}
          </div>
        ) : null}
        {aggregatedCart.aggregatedCart.length ? (
          <div className="shipping-details">
            <h3>Customer Details</h3>
            <input
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={shippingDetails.fullName}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={shippingDetails.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="number"
              placeholder="Your number"
              value={shippingDetails.number}
              onChange={handleInputChange}
              required
            />
          </div>
        ) : null}
        {aggregatedCart.aggregatedCart.length ? (
          <div className="shipping-details">
            <h3>Delivery Information</h3>
            <input
              type="text"
              name="recipientName"
              placeholder="Recipient name"
              value={shippingDetails.recipientName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={shippingDetails.address}
              onChange={handleInputChange}
              required
            />
            <select
              name="homeType"
              value={shippingDetails.homeType}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled hidden>
                Is this a building or private home?
              </option>
              <option value="building">Building</option>
              <option value="home">Private Home</option>
            </select>

            {shippingDetails.homeType === "building" && (
              <>
                <input
                  type="text"
                  name="apartmentNumber"
                  placeholder="Apartment number"
                  value={shippingDetails.apartmentNumber}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="floor"
                  placeholder="Floor"
                  value={shippingDetails.floor}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="code"
                  placeholder="Building code"
                  value={shippingDetails.code}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}
            <input
              type="text"
              name="city"
              placeholder="City"
              value={shippingDetails.city}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="zipCode"
              placeholder="Zip code"
              value={shippingDetails.zipCode}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="contactNumber"
              placeholder="Recipient contact number"
              value={shippingDetails.contactNumber}
              onChange={handleInputChange}
              required
            />
          </div>
        ) : null}
        {aggregatedCart.aggregatedCart.length ? (
          <div className="delivery-options">
            <h3>Delivery Options</h3>
            <select
              onChange={handleDeliveryOptionChange}
              defaultValue=""
              required
            >
              <option value="" disabled hidden>
                Select a delivery option
              </option>
              {DELIVERY_OPTIONS.map((option, index) => (
                <option key={index} value={index}>
                  {option.label} - ${option.charge}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="total-price">
          <h3>
            Total: {currency === "Dollar" ? "$" : "₪"}
            {calculateTotalPrice()}
          </h3>
        </div>
        {aggregatedCart.aggregatedCart.length ? (
          <div className="submit-order-btn-wrapper">
            <button
              type="button"
              className="submit-order-btn"
              disabled={
                !isFormValid || aggregatedCart.aggregatedCart.length === 0
              }
              onClick={handleCheckout}
            >
              Proceed to Payment
            </button>
            {!isFormValid || aggregatedCart.aggregatedCart.length === 0 ? (
              <div className="submit-order-btn-tooltip">
                Please fill out all fields.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Checkout;
