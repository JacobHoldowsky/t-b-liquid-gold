import React, { useContext, useState } from "react";
import { CurrencyContext } from "../context/CurrencyContext"; // Assuming you have a currency context
import "./SponsorAHoneyBoard.css"; // Custom CSS for styling
import { FaCheckCircle } from "react-icons/fa"; // Import a checkmark icon
import { ExchangeRateContext } from "../context/ExchangeRateContext";

function SponsorAHoneyBoard({ cart, addToCart, setDeliveryFee }) {
  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);
  const [addedToCart, setAddedToCart] = useState(false);

  const calculatePriceInShekels = (priceDollar, exchangeRate) => {
    return exchangeRate
      ? Math.ceil(priceDollar * exchangeRate)
      : Math.ceil(priceDollar * 3.7);
  };

  const price = 75; // Fixed price in USD
  const deliveryFee = 10; // Flat rate delivery fee for the special gift

  const handleAddToCart = () => {
    // Create an item object for the honey board
    const itemToAdd = {
      url: "Sponsor a honey board with plastic-min.png",
      title: "Sponsor a Honey Board",
      description:
        "5 flavored creamed honeys size 70ml, Half bottle of wine, 5 Dairy Belgian chocolates, Wooden honey dipper",
      priceDollar: price,
      priceShekel: calculatePriceInShekels(75, exchangeRate), // Assuming a rough conversion rate
      quantity: 1,
      deliveryFee, // Assign the special delivery fee
    };

    // Add the item to the cart
    addToCart(itemToAdd);

    // Set the flat rate delivery fee in the checkout component
    setDeliveryFee(deliveryFee);

    // Show confirmation notification
    setAddedToCart(true);
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
        {/* Add the image here */}
        <div className="sponsor-image">
          <img
            src="/Sponsor a honey board with plastic-min.png"
            alt="Sponsor a Honey Board"
          />
        </div>
        <h3>Sponsor a Honey Board</h3>
        <p>
          <strong>Price:</strong>{" "}
          {currency === "Dollar" ? `$${price}` : `₪${Math.ceil(price * 3.7)}`}
        </p>
        <p></p>
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
          <button onClick={handleAddToCart} className="sponsor-board-add-to-cart-btn">
            Sponsor Now
          </button>
        )}
      </div>
    </div>
  );
}

export default SponsorAHoneyBoard;
