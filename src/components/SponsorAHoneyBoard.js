import React, { useContext, useState, useMemo } from "react";
import { CurrencyContext } from "../context/CurrencyContext";
import "./SponsorAHoneyBoard.css";
import { FaCheckCircle } from "react-icons/fa";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import QuantitySelector from "./QuantitySelector";

// Function to calculate price in Shekels
const calculatePriceInShekels = (priceDollar, exchangeRate) => {
  return exchangeRate
    ? Math.ceil(priceDollar * exchangeRate)
    : Math.ceil(priceDollar * 3.7);
};

function SponsorAHoneyBoard({ cart, addToCart, setDeliveryFee }) {
  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const price = 75; // Fixed price in USD
  const deliveryFee = 10; // Flat rate delivery fee for the special gift

  // Memoize price calculation to avoid re-computation on every render
  const priceInShekels = useMemo(
    () => calculatePriceInShekels(price, exchangeRate),
    [price, quantity, exchangeRate]
  );

  // Handle adding to cart
  const handleAddToCart = () => {
    const itemToAdd = {
      url: "Sponsor a honey board with plastic-min.png",
      title: "Sponsor a Honey Board",
      description:
        "5 flavored creamed honeys size 70ml, Half bottle of wine, 5 Dairy Belgian chocolates, Wooden honey dipper",
      priceDollar: price,
      priceShekel: priceInShekels,
      quantity,
      deliveryFee,
    };

    addToCart(itemToAdd);
    setDeliveryFee(deliveryFee);
    setAddedToCart(true);

    // Reset addedToCart after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="sponsor-honey-board">
      <h2>Sponsor a Honey Board</h2>
      <p>
        This year, we have been through very challenging times in Israel. Many
        people are grieving the loss of their loved ones, many are anxiously
        awaiting the return of their loved ones, and many women are alone for
        many months while their husbands are fighting the war. We invite you to
        partner with us and send sweetness and support to our brothers in
        Israel. We created a special board for these families to gift them with
        5 of our unique flavored creamed honeys along with wine and chocolate.
        Please consider sponsoring a honey board, and we will distribute it on
        your behalf. Thank you for helping us spread the sweetness of our honeys
        to the ones who need it most.
      </p>
      <div className="sponsor-board-details">
        <div className="sponsor-image">
          <img
            src="/Sponsor a honey board with plastic-min.png"
            alt="Sponsor a Honey Board"
          />
        </div>
        <h3>Sponsor a Honey Board</h3>
        <p>
          <strong>Price:</strong>{" "}
          {currency === "Dollar"
            ? `$${price}`
            : `₪${priceInShekels}`}
        </p>
        <QuantitySelector
          quantity={quantity}
          handleQuantityChange={(e) =>
            setQuantity(parseInt(e.target.value, 10))
          }
        />
        <ul>
          <li>5 flavored creamed honeys size 70ml</li>
          <li>Half bottle of wine</li>
          <li>5 Dairy Belgian chocolates</li>
          <li>Wooden honey dipper</li>
        </ul>
        {addedToCart ? (
          <div className="notification show">
            <FaCheckCircle className="checkmark" />
            Added to cart
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="sponsor-board-add-to-cart-btn"
          >
            Sponsor Now
          </button>
        )}
      </div>
    </div>
  );
}

export default SponsorAHoneyBoard;
