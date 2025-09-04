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
    onConfirm: () => {},
  });
  const [isInstitution, setIsInstitution] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationModalContent, setLocationModalContent] = useState({
    title: "",
    locations: [],
  });

  const CHOSEN_EXCHANGE_RATE = 3.46;

  const DELIVERY_OPTIONS = [
    {
      label: "Pickup in Ramat Eshkol (Sderot Eshkol 14)",
      charge: 0,
    },
    {
      label: "Jerusalem",
      charge: currency === "Dollar" ? 15 : Math.ceil(15 * CHOSEN_EXCHANGE_RATE),
    },
    {
      label: "RBS",
      charge: currency === "Dollar" ? 17 : Math.ceil(17 * CHOSEN_EXCHANGE_RATE),
    },
    {
      label: "Givat Zeev, Modiin, Mevaseret Tzion",
      charge: currency === "Dollar" ? 20 : Math.ceil(20 * CHOSEN_EXCHANGE_RATE),
    },
    {
      label: "Mitzpe Yericho, Maaleh Adumim",
      charge: currency === "Dollar" ? 25 : Math.ceil(25 * CHOSEN_EXCHANGE_RATE),
    },
    {
      label:
        "Gush: Beitar, Efrat, Neve Daniel, Elazar, Kfar Etzion, Tekoa, Alon Shvut, Bat Ayin",
      charge: currency === "Dollar" ? 30 : Math.ceil(30 * CHOSEN_EXCHANGE_RATE),
    },
    {
      label:
        "Central Israel: Tel Aviv, Hertzliyah, Netanya, Rishon L'tzion, Bnei Brak, Petach Tikva, Kfar Saba, Ranaana, Givat Shmuel, Ramat Gan, Rechovot, Givatayim, Ramat Hasharon",
      charge: currency === "Dollar" ? 30 : Math.ceil(30 * CHOSEN_EXCHANGE_RATE),
    },
    {
      label:
        "All other locations that are not listed here, please contact us to inquire on delivery price",
      charge: 0,
      dontShowPrice: true,
      isWhatsApp: true,
    },
  ];

  const US_DELIVERY_OPTIONS = [
    {
      label: "Anywhere in the Five Towns",
      charge: currency === "Dollar" ? 15 : Math.ceil(15 * CHOSEN_EXCHANGE_RATE),
    },
    {
      label: "Anywhere in the USA",
      charge: currency === "Dollar" ? 20 : Math.ceil(20 * CHOSEN_EXCHANGE_RATE),
    },
  ];

  const CENTRAL_ISRAEL_LOCATIONS = [
    "Tel Aviv",
    "Hertzliyah",
    "Netanya",
    "Rishon L'tzion",
    "Bnei Brak",
    "Petach Tikva",
    "Kfar Saba",
    "Ranaana",
    "Givat Shmuel",
    "Ramat Gan",
    "Rechovot",
    "Givatayim",
    "Ramat Hasharon",
  ];

  const GUSH_LOCATIONS = [
    "Beitar",
    "Efrat",
    "Neve Daniel",
    "Elazar",
    "Kfar Etzion",
    "Tekoa",
    "Alon Shvut",
    "Bat Ayin",
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
    (item) =>
      item.category === "sponsor a board" ||
      item.title === "Send a Mishloach Manos to a Soldier Family"
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
              name: `${item.title} ${
                item.selectedFlavors.length > 0
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
      const totalDeliveryCharge = (() => {
        if (specialDeliveryOnly) return 0;

        // If US shop: always use selected US delivery charge (15 or 20)
        if (shopRegion === "US") return deliveryCharge || 0;

        // If Israel: charge only when there's at least one non-sponsor item
        const hasChargeableItems = aggregatedCart.aggregatedCart.some(
          (i) => i.category !== "sponsor a board"
        );

        // Only include delivery if user actually selected an option
        if (hasChargeableItems && selectedDeliveryOption) {
          return deliveryCharge || 0;
        }

        return 0;
      })();

      // Do NOT push a delivery line item here; the server adds it based on deliveryCharge.

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: lineItems,
          hasComments: hasComments,
          giftNote: giftNote || null,
          comments: hasComments ? comments : null,
          shippingDetails,
          deliveryCharge: totalDeliveryCharge,
          selectedDeliveryOption,
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

  const handleLocationClick = (type) => {
    if (type === "central") {
      setLocationModalContent({
        title: "Is your location in Central Israel?",
        locations: CENTRAL_ISRAEL_LOCATIONS,
        type: type,
        charge: DELIVERY_OPTIONS.find((opt) =>
          opt.label.includes("Central Israel")
        ).charge,
      });
    } else if (type === "gush") {
      setLocationModalContent({
        title: "Is your location in the Gush?",
        locations: GUSH_LOCATIONS,
        type: type,
        charge: DELIVERY_OPTIONS.find((opt) => opt.label.includes("Gush"))
          .charge,
      });
    }
    setIsLocationModalOpen(true);
  };

  const handleUSDeliveryOptionChange = (e) => {
    const opt = US_DELIVERY_OPTIONS[e.target.value];
    if (!opt) return;
    setSelectedDeliveryOption(opt.label);
    setDeliveryCharge(opt.charge);
  };

  const handleDeliveryOptionChange = (e) => {
    const selectedOption = DELIVERY_OPTIONS[e.target.value];

    // Handle location information buttons
    if (selectedOption.label.includes("Central Israel")) {
      handleLocationClick("central");
      return;
    } else if (selectedOption.label.includes("Gush")) {
      handleLocationClick("gush");
      return;
    }

    const whatsappUrl =
      shopRegion === "US"
        ? "https://wa.me/message/AUHFRK2KKV27O1"
        : "https://wa.me/+972534309254";

    if (selectedOption.isWhatsApp) {
      setModalConfig({
        title: "Location Not Listed",
        message: (
          <div>
            <p>Please reach out to us via WhatsApp to complete your order.</p>
            <button
              onClick={() => window.open(whatsappUrl, "_blank")}
              className="whatsapp-button"
            >
              Contact via WhatsApp
            </button>
          </div>
        ),
        onConfirm: () => {
          closeModal();
          setSelectedDeliveryOption(null);
          setDeliveryCharge(0);
        },
      });
      setIsModalOpen(true);
      return;
    }

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
    // Shipping: US = only the selected option; IL = selected option if applicable
    let totalDeliveryCharge = 0;
    if (shopRegion === "US") {
      totalDeliveryCharge = deliveryCharge; // just $15 or $20
    } else if (
      !specialDeliveryOnly &&
      aggregatedCart.aggregatedCart.some(
        (item) => item.category !== "sponsor a board"
      )
    ) {
      totalDeliveryCharge = deliveryCharge; // Israel list charge
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
    if (!selectedDeliveryOption) return;

    const source = shopRegion === "US" ? US_DELIVERY_OPTIONS : DELIVERY_OPTIONS;
    const selected = source.find((o) => o.label === selectedDeliveryOption);
    if (selected) {
      setDeliveryCharge(selected.charge);
    }
  }, [currency, exchangeRate, selectedDeliveryOption, shopRegion]);

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
      const mandatoryFields = [
        shippingDetails.fullName,
        shippingDetails.email,
        shippingDetails.number,
        shippingDetails.recipientName,
        shippingDetails.address,
        shippingDetails.city,
        shippingDetails.contactNumber,
      ];

      // Only include homeType in validation if not an institution
      if (!isInstitution) {
        mandatoryFields.push(shippingDetails.homeType);
      }

      const areMandatoryFieldsFilled = mandatoryFields.every(
        (field) => field.trim() !== ""
      );

      const areBuildingFieldsFilled =
        shippingDetails.homeType === "building" && !isInstitution
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
  }, [
    shippingDetails,
    selectedDeliveryOption,
    specialDeliveryOnly,
    isInstitution,
  ]);

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
        <div className="kashrut-box">
          {shopRegion === "US" && (
            <>
              <p className="us-kashrut-disclaimer">
                ** Note for US Customers **
              </p>
              <p className="us-kashrut-disclaimer">
                All honey jars on the US site are imported from Israel and are
                under the same hashgacha as the Israel site (Vaad Hakashrus
                Rabbi Shmuel Weiner). The gift packages that are listed on the
                US site are not included under this hashgacha. Each gift package
                on the US site lists the hashgacha of the items included in the
                package. Please review this carefully before ordering to make
                sure it meets your standards of kashrus.
              </p>
            </>
          )}
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
            </ul>
          )}
        </div>
        <div className="total-price">
          <h3>
            Total: {currency === "Dollar" ? "$" : "₪"}
            {calculateTotalPrice()}
          </h3>
        </div>
        {/* {aggregatedCart.aggregatedCart.length ? (
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
        ) : null} */}
        {aggregatedCart.aggregatedCart.length ? (
          <>
            {/* Only show gift note box if cart has non-soldier family items */}
            {!aggregatedCart.aggregatedCart.every(
              (item) =>
                item.title === "Send a Mishloach Manos to a Soldier Family"
            ) && (
              <div className="gift-option">
                <h3>Gift Note</h3>
                <p>
                  Add a personal message to include with your order (optional)
                </p>
                <textarea
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value.slice(0, 400))}
                  placeholder="Enter your gift message here (max 400 characters)"
                  rows="4"
                  maxLength="400"
                />
              </div>
            )}

            {/* Comments section remains available for all orders */}
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
                {/* Institution checkbox - moved here, above Delivery Options */}
                {!aggregatedCart.aggregatedCart.every(
                  (item) =>
                    item.title === "Send a Mishloach Manos to a Soldier Family"
                ) && (
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
                          <strong>Important Note:</strong> If the student is
                          unreachable, packages are delivered to the school's
                          office/reception/guard or given to a fellow student.
                          We do not accept responsibility once the package has
                          been delivered to the institution.
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                          {option.label}
                          {!option.dontShowPrice && (
                            <>
                              {" - "}
                              {currency === "Dollar" ? "$" : "₪"}
                              {option.charge}
                            </>
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="delivery-options">
                    <h3>Delivery Options</h3>
                    <select
                      onChange={handleUSDeliveryOptionChange}
                      defaultValue=""
                      required
                    >
                      <option value="" disabled hidden>
                        Select a delivery option *
                      </option>
                      {US_DELIVERY_OPTIONS.map((option, index) => (
                        <option key={index} value={index}>
                          {option.label}
                          {!option.dontShowPrice && (
                            <>
                              {" - "}
                              {currency === "Dollar" ? "$" : "₪"}
                              {option.charge}
                            </>
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                    {shopRegion !== "US" && !isInstitution ? (
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
                      shopRegion !== "US" &&
                      !isInstitution && (
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

                    {/* Only show zip code field for US orders */}
                    {shopRegion === "US" && (
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="Zip code *"
                        value={shippingDetails.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    )}
                    <label>
                      Must be a local
                      {shopRegion === "US" ? " American" : " Israeli"} phone
                      number
                    </label>
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
            ) : (
              aggregatedCart.aggregatedCart.some(
                (item) =>
                  item.title === "Send a Mishloach Manos to a Soldier Family"
              ) && (
                <div className="delivery-message">
                  <p>
                    No need for delivery details, we will deliver it to the
                    soldier family on your behalf.
                  </p>
                </div>
              )
            )}
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
        {shopRegion === "US" && (
          <p className="availability-note">Shipping takes 5-7 business days.</p>
        )}
        {shopRegion === "US" && (
          <p className="availability-note">
            Deliver in the Five Towns takes 1-2 business days.
          </p>
        )}
        {shopRegion !== "US" && (
          <p className="availability-note">
            All deliveries will be done between September 14th and Rosh Hashana.
            If you need an earlier delivery please reach out to us on WhatsApp.
          </p>
        )}
        {shopRegion === "US" && (
          <p className="availability-note">
            If you order after September 16th, we are happy to ship out your
            order but cannot guarantee that it will arrive before Rosh Hashana.
            If you order after this date, please reach out to us.
          </p>
        )}
        {shopRegion !== "US" && (
          <p className="availability-note">
            If you would like to place an order after the September 16 deadline
            please reach out to us prior to placing your order to ensure that
            your order will arrive in time for Rosh Hashana.
          </p>
        )}
        <p className="availability-note">
          Invoices are not available but email confirmations are sent of your
          order.
        </p>
        <p className="availability-note">
          If recipient is not home, the package will be left by the door.
        </p>
        {/* {aggregatedCart.aggregatedCart.length ? (
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
        ) : null} */}

        <p className="availability-notee">
          The website is down for maintenance
        </p>

        {isLoading && <Loading />}

        <Modal
          isOpen={isModalOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={closeModal}
        />

        <Modal
          isOpen={isLocationModalOpen}
          title={locationModalContent.title}
          message={
            <div>
              <p>Please check if your location is in this list:</p>
              <ul className="location-list">
                {locationModalContent.locations.map((location, index) => (
                  <li key={index}>{location}</li>
                ))}
              </ul>
              <p>Is your location listed above?</p>
            </div>
          }
          onConfirm={() => {
            // If user confirms their location is in the list, set the delivery option
            const label =
              locationModalContent.type === "central"
                ? "Central Israel (Click here for Central Israel Locations)"
                : "Gush (Click here for Gush Locations)";
            setSelectedDeliveryOption(label);
            setDeliveryCharge(locationModalContent.charge);
            setIsLocationModalOpen(false);
          }}
          onCancel={() => {
            const whatsappUrl =
              shopRegion === "US"
                ? "https://wa.me/message/AUHFRK2KKV27O1"
                : "https://wa.me/+972534309254";
            // Show WhatsApp message and button when user clicks "No"
            setModalConfig({
              title: "Location Not Listed",
              message: (
                <div>
                  <p>
                    Please reach out to us via WhatsApp to complete your order.
                  </p>
                  <button
                    onClick={() => window.open(whatsappUrl, "_blank")}
                    className="whatsapp-button"
                  >
                    Contact via WhatsApp
                  </button>
                </div>
              ),
              onConfirm: () => {
                closeModal();
                setSelectedDeliveryOption(null);
                setDeliveryCharge(0);
              },
            });
            setIsLocationModalOpen(false);
            setIsModalOpen(true);
          }}
          confirmText="Yes, my location is listed"
          cancelText="No, my location is not listed"
        />
      </div>
    </div>
  );
}

export default Checkout;
