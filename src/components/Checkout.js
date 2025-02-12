import React, { useMemo, useContext, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Link } from "react-router-dom"; // Import Link
import "./Checkout.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check
import Modal from "../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; // Import the arrow icon

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function Checkout({ cart, setCart, removeFromCart }) {
  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [hasComments, setHasComments] = useState(false);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    state: "",
    zipCode: "",
    contactNumber: "",
  });
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ message: "", type: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => { },
  });
  const [isInstitution, setIsInstitution] = useState(false);
  const [institutionName, setInstitutionName] = useState("");

  const DELIVERY_OPTIONS = [
    {
      label: "Pick up in Ramat Eshkol",
      charge: currency === "Dollar" ? 0 : Math.ceil(0 * exchangeRate),
    },
    {
      label: "Ramat Eshkol, French Hill, Arzei Habira, Sanhedria, Maalot Dafna",
      charge: currency === "Dollar" ? 10 : Math.ceil(10 * exchangeRate),
    },
    {
      label: "Anywhere in Jerusalem",
      charge: currency === "Dollar" ? 15 : Math.ceil(15 * exchangeRate),
    },
    {
      label: "Beit Shemesh, RBS",
      charge: currency === "Dollar" ? 15 : Math.ceil(15 * exchangeRate),
    },
    {
      label:
        "Beitar, Efrat, Bat Ayin, Neve Daniel, Mevaseret, Modiin, Givat Zeev",
      charge: currency === "Dollar" ? 20 : Math.ceil(20 * exchangeRate),
    },
    {
      label: "Anywhere in Israel",
      charge: currency === "Dollar" ? 25 : Math.ceil(25 * exchangeRate),
    },
  ];

  // Function to open modal
  const openModal = (title, message, onConfirm) => {
    setModalConfig({ title, message, onConfirm });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Check if "Sponsor a Honey Board" is in the cart
  const isSponsorHoneyBoardInCart = useMemo(() => {
    return cart.some((item) => item.category === "sponsor a board");
  }, [cart]);

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

  let specialDeliveryOnly = aggregatedCart.aggregatedCart.every(
    (item) => item.category === "sponsor a board"
  );

  const apiUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api/create-checkout-session"
      : "/api/create-checkout-session";

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const stripe = await stripePromise;

      const logoChargePerType =
        currency === "Dollar" ? 5000 : Math.ceil(50 * exchangeRate * 100);

      const lineItems = aggregatedCart.aggregatedCart.map((item) => {
        const basePrice =
          currency === "Dollar"
            ? item.priceDollar
            : Math.ceil(item.priceShekel);

        return {
          price_data: {
            currency: currency === "Dollar" ? "usd" : "ils",
            product_data: {
              name: `${item.title} ${item.selectedFlavors.length > 0
                ? "(" + item.selectedFlavors.join(", ") + ")"
                : ""
                }`,
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

      // Add delivery charge as a separate line item (not discounted)
      const totalDeliveryCharge = calculateShippingCharge(); // Calculate delivery charge
      // if (totalDeliveryCharge > 0) {
      //   lineItems.push({
      //     price_data: {
      //       currency: currency === "Dollar" ? "usd" : "ils",
      //       product_data: {
      //         name: "Delivery Charge",
      //       },
      //       unit_amount: totalDeliveryCharge * 100, // Convert to cents
      //     },
      //     quantity: 1,
      //   });
      // }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: lineItems,
          gift: isGift,
          hasComments: hasComments,
          giftNote: isGift ? giftNote : null,
          comments: hasComments ? comments : null,
          shippingDetails,
          deliveryCharge:
            shopRegion === "US" ? totalDeliveryCharge : deliveryCharge,
          selectedDeliveryOption:
            shopRegion === "US"
              ? "Total Delivery Charge"
              : selectedDeliveryOption,
          isSponsorHoneyBoardInCart,
          promoCode: promoCode,
          currency,
          exchangeRate,
          specialDeliveryOnly,
          isInstitution,
          institutionName,
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
    } finally {
      setIsLoading(false);
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
    if (promoCode.includes("5")) {
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

  const calculateHoneyJarShippingFee = () => {
    if (shopRegion !== "US") return 0; // Only calculate if shopRegion is "US"

    let honeyJarCount = 0;

    aggregatedCart.aggregatedCart.forEach((item) => {
      if (item.category === "honey jars") {
        honeyJarCount += item.quantity;
      }
    });

    if (honeyJarCount > 0) {
      return honeyJarCount <= 4
        ? currency === "Dollar"
          ? 16
          : Math.ceil(16 * exchangeRate) // Round up
        : currency === "Dollar"
          ? 20
          : Math.ceil(20 * exchangeRate); // Round up
    }

    return 0;
  };

  const calculateShippingCharge = () => {
    if (shopRegion !== "US") return 0; // Only calculate if shopRegion is "US"

    let honeyJarCount = 0;
    let boardOfFourCount = 0;
    let otherGiftPackageCount = 0;

    aggregatedCart.aggregatedCart.forEach((item) => {
      if (item.category === "honey jars") {
        honeyJarCount += item.quantity;
      } else if (item.category === "gift packages") {
        if (item.title.includes("Board of Four")) {
          boardOfFourCount += item.quantity;
        } else {
          otherGiftPackageCount += item.quantity;
        }
      }
    });

    let shippingCharge = 0;

    // Calculate shipping for all honey jars together
    if (honeyJarCount > 0) {
      shippingCharge +=
        honeyJarCount <= 4
          ? currency === "Dollar"
            ? 16
            : Math.ceil(16 * exchangeRate) // Round up
          : currency === "Dollar"
            ? 20
            : Math.ceil(20 * exchangeRate); // Round up
    }

    // Calculate shipping for gift packages
    shippingCharge +=
      boardOfFourCount *
      (currency === "Dollar" ? 16 : Math.ceil(16 * exchangeRate)) +
      otherGiftPackageCount *
      (currency === "Dollar" ? 20 : Math.ceil(20 * exchangeRate));

    return shippingCharge;
  };

  const honeyJarExists = aggregatedCart.aggregatedCart.some(
    (item) => item.category === "honey jars"
  );

  const calculateTotalPrice = () => {
    const itemSubtotal = aggregatedCart.aggregatedCart.reduce((total, item) => {
      const price =
        currency === "Dollar" ? item.priceDollar : Math.ceil(item.priceShekel);
      return total + parseFloat(price) * item.quantity;
    }, 0);

    const logoChargePerType =
      currency === "Dollar" ? 50 : Math.ceil(50 * exchangeRate);
    const totalLogoCharge = aggregatedCart.uniqueLogoCount * logoChargePerType;

    // Use new shipping calculation function
    let totalDeliveryCharge = calculateShippingCharge();

    if (
      !specialDeliveryOnly &&
      aggregatedCart.aggregatedCart.some(
        (item) => item.category !== "sponsor a board"
      )
    ) {
      totalDeliveryCharge += deliveryCharge; // Add normal delivery charge for other items
    }

    // Calculate the subtotal for items and additional charges only (excluding delivery charge)
    const subtotalForDiscount = itemSubtotal + totalLogoCharge;

    // Apply discount only on the subtotal excluding delivery charge
    const discount = isPromoApplied ? subtotalForDiscount * 0.05 : 0;

    // Calculate the final total price, including the selected delivery charge
    const total = subtotalForDiscount - discount + totalDeliveryCharge; // Include the selected delivery charge

    // Check if the total has a decimal part
    const hasDecimal = total % 1 !== 0;

    // Round up the total only if it's a whole number (e.g., 50.0 should become 51)
    const finalTotal = hasDecimal ? total : Math.ceil(total);

    return formatNumberWithCommas(finalTotal.toFixed(2));
  };

  function Loading() {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const updateItemQuantity = (itemKey, newQuantity) => {
    const itemToUpdate = cart.find(
      (item) =>
        (item.selectedFlavors?.length
          ? `${item.title}-${item.selectedFlavors.join(",")}`
          : item.title) === itemKey
    );

    if (!itemToUpdate) {
      return; // If no item is found, return early
    }

    const itemUniqueKey = itemToUpdate.selectedFlavors?.length
      ? `${itemToUpdate.title}-${itemToUpdate.selectedFlavors.join(",")}`
      : itemToUpdate.title;

    // Handling for "Mini Four Collection Board" with a minimum quantity check
    if (
      itemToUpdate.title === "Mini Four Collection Board" &&
      newQuantity < 5
    ) {
      openModal(
        "Remove Item?",
        "The minimum quantity for Mini Four Collection Board is 5. Would you like to remove them all from your cart?",
        () => {
          const updatedCart = cart.filter(
            (item) =>
              !(
                item.title === "Mini Four Collection Board" &&
                (item.selectedFlavors?.length
                  ? `${item.title}-${item.selectedFlavors.join(",")}`
                  : item.title) === itemUniqueKey
              )
          );
          setCart(updatedCart);
          localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
          closeModal();
        }
      );
      return;
    }

    // Removing an item when quantity is less than or equal to 0
    if (newQuantity <= 0) {
      openModal(
        "Remove Item?",
        "Do you want to remove this item from your cart?",
        () => {
          const updatedCart = cart.filter(
            (item) =>
              (item.selectedFlavors?.length
                ? `${item.title}-${item.selectedFlavors.join(",")}`
                : item.title) !== itemKey
          );
          setCart(updatedCart);
          localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
          closeModal();
        }
      );
    } else {
      // Updating item quantity
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
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
    }
  };

  // New effect to recalculate delivery charge on currency change
  useEffect(() => {
    if (selectedDeliveryOption) {
      const selectedOption = DELIVERY_OPTIONS.find(
        (option) => option.label === selectedDeliveryOption
      );
      if (selectedOption) {
        setDeliveryCharge(selectedOption.charge);
      }
    }
  }, [currency, exchangeRate, selectedDeliveryOption]);

  useEffect(() => {
    if (cart.length === 0) {
      setDeliveryCharge(0);
      setSelectedDeliveryOption(null);
    }
  }, [cart]);

  useEffect(() => {
    let isFormValid = false; // Default to false

    if (
      specialDeliveryOnly ||
      (deliveryCharge === 0 && selectedDeliveryOption)
    ) {
      // When specialDeliveryOnly is true, only these fields are required
      const areMandatoryFieldsFilled = [
        shippingDetails.fullName,
        shippingDetails.email,
        shippingDetails.number,
      ].every((field) => field.trim() !== "");

      isFormValid = areMandatoryFieldsFilled; // Only check these fields
    } else if (shopRegion === "US") {
      const areMandatoryFieldsFilled = [
        shippingDetails.fullName,
        shippingDetails.email,
        shippingDetails.number,
        shippingDetails.recipientName,
        shippingDetails.address,
        shippingDetails.city,
        shippingDetails.state,
        shippingDetails.contactNumber,
      ].every((field) => field.trim() !== "");

      isFormValid = areMandatoryFieldsFilled;
    } else {
      // When specialDeliveryOnly is false, perform full validation
      const areMandatoryFieldsFilled = [
        shippingDetails.fullName,
        shippingDetails.email,
        shippingDetails.number,
        shippingDetails.recipientName,
        shippingDetails.address,
        shippingDetails.homeType,
        shippingDetails.city,
        shippingDetails.contactNumber,
      ].every((field) => field.trim() !== "");

      const areBuildingFieldsFilled =
        shippingDetails.homeType === "building"
          ? [shippingDetails.apartmentNumber].every(
            (field) => field.trim() !== ""
          )
          : true;

      isFormValid =
        areMandatoryFieldsFilled &&
        areBuildingFieldsFilled &&
        selectedDeliveryOption; // Validate all fields
    }

    setIsFormValid(isFormValid);
  }, [shippingDetails, selectedDeliveryOption, specialDeliveryOnly]);

  return (
    <div className="checkout-container">
      <div className="checkout">
        <h2>Checkout</h2>
        <div className="continue-shopping-wrapper">
          <Link to="/" className="continue-shopping-btn">
            <FontAwesomeIcon
              icon={faArrowLeft}
              style={{ marginRight: "8px" }}
            />{" "}
            Continue Shopping
          </Link>
        </div>
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
                    {shopRegion === "US" &&
                      item.category === "gift packages" &&
                      item.title !== "T&Bee Collection Box" &&
                      item.title !== "Board of Four" &&
                      item.title !== "Box of Four" ? (
                      <p className="item-flavors">
                        Delivery:{" "}
                        {currency === "Dollar"
                          ? `$20 each`
                          : `₪${Math.ceil(20 * exchangeRate)} each`}{" "}
                      </p>
                    ) : null}
                    {shopRegion === "US" && item.title === "Board of Four" ? (
                      <p className="item-flavors">
                        Delivery:{" "}
                        {currency === "Dollar"
                          ? `$16 each`
                          : `₪${Math.ceil(16 * exchangeRate)} each`}{" "}
                      </p>
                    ) : null}
                    {item.includeLogo && (
                      <p className="item-logo">
                        Personalized Logo (
                        {currency === "Dollar"
                          ? `+ One time fee of $50`
                          : `+ One time fee of ₪${Math.ceil(
                            50 * exchangeRate
                          )}`}
                        )
                      </p>
                    )}
                    <p className="item-price">
                      {currency === "Dollar"
                        ? `$${formatNumberWithCommas(
                          parseFloat(item.priceDollar)
                        )}`
                        : `₪${formatNumberWithCommas(
                          Math.ceil(item.priceShekel)
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
              {honeyJarExists && shopRegion === "US" && (
                <p className="item-flavors">
                  Delivery Fee for Honey Jars:{" "}
                  {currency === "Dollar"
                    ? `$${calculateHoneyJarShippingFee()}`
                    : `₪${calculateHoneyJarShippingFee()}`}
                </p>
              )}
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
          <>
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
            <div className="gift-option">
              <label>
                <input
                  type="checkbox"
                  checked={hasComments}
                  onChange={(e) => setHasComments(e.target.checked)}
                />
                Add comments
              </label>
              {hasComments && (
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value.slice(0, 400))}
                  placeholder="Include comments (max 400 characters)"
                  rows="4"
                  maxLength="400"
                />
              )}
            </div>
            {/* Customer Details */}
            <div className="shipping-details">
              <h3>Customer Details</h3>
              <input
                type="text"
                name="fullName"
                placeholder="Your full name *"
                value={shippingDetails.fullName}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your email *"
                value={shippingDetails.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="number"
                placeholder="Your number *"
                value={shippingDetails.number}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Conditionally render delivery information based on specialDeliveryOnly */}
            {!specialDeliveryOnly ? (
              <>
                {/* Delivery Options */}
                {shopRegion !== "US" ? (
                  <div className="delivery-options">
                    <h3>Delivery Options</h3>
                    <select
                      onChange={handleDeliveryOptionChange}
                      defaultValue=""
                      required
                    >
                      <option value="" disabled hidden>
                        Select a delivery option *
                      </option>
                      {DELIVERY_OPTIONS.map((option, index) => (
                        <option key={index} value={index}>
                          {option.label} - {currency === "Dollar" ? "$" : "₪"}
                          {option.charge}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                {/* Delivery Information */}
                {shopRegion === "US" || deliveryCharge > 0 ? (
                  <div className="shipping-details">
                    <h3>Delivery Information</h3>
                    {/* Delivery Information Fields */}
                    <label>First & Last</label>
                    <input
                      type="text"
                      name="recipientName"
                      placeholder="Recipient name *"
                      value={shippingDetails.recipientName}
                      onChange={handleInputChange}
                      required
                    />
                    <label>Street name and number</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Address *"
                      value={shippingDetails.address}
                      onChange={handleInputChange}
                      required
                    />
                    {shopRegion !== "US" ? (
                      <select
                        name="homeType"
                        value={shippingDetails.homeType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled hidden>
                          Is this a building or private home? *
                        </option>
                        <option value="building">Building</option>
                        <option value="home">Private Home</option>
                      </select>
                    ) : null}
                    {/* Additional Fields for Buildings */}
                    {shippingDetails.homeType === "building" &&
                      shopRegion !== "US" && (
                        <>
                          <input
                            type="text"
                            name="apartmentNumber"
                            placeholder="Apartment number *"
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
                          />
                          <input
                            type="text"
                            name="code"
                            placeholder="Building code"
                            value={shippingDetails.code}
                            onChange={handleInputChange}
                          />
                        </>
                      )}
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      value={shippingDetails.city}
                      onChange={handleInputChange}
                      required
                    />
                    {shopRegion === "US" ? (
                      <input
                        type="text"
                        name="state"
                        placeholder="State *"
                        value={shippingDetails.state}
                        onChange={handleInputChange}
                        required
                      />
                    ) : null}
                    <input
                      type="text"
                      name="country"
                      value={shopRegion === "US" ? "USA" : "Israel"}
                      readOnly
                      className="country-field"
                    />

                    {/* Informative Note Below the Country Field */}
                    <p className="country-info">
                      You can switch the country by clicking the toggle in the
                      header.
                    </p>

                    <input
                      type="text"
                      name="zipCode"
                      placeholder={`Zip code ${shopRegion === "US" ? "*" : ""}`}
                      value={shippingDetails.zipCode}
                      onChange={handleInputChange}
                    />
                    <label>Must be a local Israeli phone number</label>
                    <input
                      type="text"
                      name="contactNumber"
                      placeholder="Recipient contact number *"
                      value={shippingDetails.contactNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ) : null}
              </>
            ) : null}
            <div className="institution-option">
              <label>
                <input
                  type="checkbox"
                  checked={isInstitution}
                  onChange={(e) => setIsInstitution(e.target.checked)}
                />
                Click here if this is going to a seminary/yeshiva
              </label>

              {isInstitution && (
                <div className="institution-details">
                  <input
                    type="text"
                    name="institutionName"
                    placeholder="Name of seminary/yeshiva *"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                  />
                  <p className="institution-warning">
                    <strong>Important Note:</strong> If the student is unreachable, packages are delivered to the school's office/reception/guard or given to a fellow student. We do not accept responsibility once the package has been delivered to the institution.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}

        {aggregatedCart.aggregatedCart.length ? (
          <div className="total-price">
            <h3>
              Total: {currency === "Dollar" ? "$" : "₪"}
              {calculateTotalPrice()}
            </h3>
          </div>
        ) : null}
        {shopRegion === "US" && !specialDeliveryOnly ? (
          <p className="availability-note">
            Shipping takes 5-7 days. We are happy to ship out your order but
            cannot guarantee that it will arrive before Rosh Hashana.
          </p>
        ) : (
          ""
        )}
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
                Please fill out all required fields.
              </div>
            ) : null}
          </div>
        ) : null}

        {isLoading && <Loading />}

        <Modal
          isOpen={isModalOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={closeModal}
        />
      </div>
    </div>
  );
}

export default Checkout;
