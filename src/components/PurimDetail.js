import React, { useState, useContext, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";
import "./PurimDetail.css";
import QuantitySelector from "./QuantitySelector";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

// Reusable Notification Component
const Notification = ({ addedToCart }) =>
  addedToCart && (
    <div className={`notification ${addedToCart === "hide" ? "hide" : "show"}`}>
      <FaCheckCircle className="checkmark" />
      Added to cart
    </div>
  );

function PurimDetail({ cart, addToCart }) {
  const { purimId } = useParams();
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Helper function to calculate price in Shekels
  const calculatePriceInShekels = (priceDollar) =>
    exchangeRate
      ? Math.ceil(priceDollar * exchangeRate)
      : Math.ceil(priceDollar * 3.7);
  // Memoize the items object to prevent unnecessary recalculations
  const items = useMemo(() => {
    const allItems = {
      kidsSpecial: {
        title: "Kids Special",
        description: "",
        priceDollar: 10,
        priceShekel: calculatePriceInShekels(10),
        imageUrl: "/Kids Special back $10.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      teaParty: {
        title: "Tea Party",
        description: "",
        priceDollar: 25,
        priceShekel: calculatePriceInShekels(25),
        imageUrl: "/Tea Party $25.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      noshBox: {
        title: "Nosh Box",
        description: "",
        priceDollar: 30,
        priceShekel: calculatePriceInShekels(30),
        imageUrl: "/Nosh Box $30.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      bochurBox: {
        title: "Bochur Box",
        description: "",
        priceDollar: 45,
        priceShekel: calculatePriceInShekels(45),
        imageUrl: "/Bochur Box $45.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      israelsGold: {
        title: "Israel's Gold",
        description: "",
        priceDollar: 65,
        priceShekel: calculatePriceInShekels(65),
        imageUrl: "/Israel's Gold $65.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      whiskeyNChocolates: {
        title: "Whiskey n' Chocolates",
        description: "",
        priceDollar: 85,
        priceShekel: calculatePriceInShekels(85),
        imageUrl: "/Whiskey n' Chocolates $85.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      familyFun: {
        title: "Family Fun",
        description: "",
        priceDollar: 100,
        priceShekel: calculatePriceInShekels(100),
        imageUrl: "/Family Fun $100.JPG",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      lchaim: {
        title: "Lchaim!",
        description: "",
        priceDollar: 120,
        priceShekel: calculatePriceInShekels(120),
        imageUrl: "/Lchaim! $120.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
      scotchNPop: {
        title: "Scotch n' Pop",
        description: "",
        priceDollar: 130,
        priceShekel: calculatePriceInShekels(130),
        imageUrl: "/Scotch n' Pop $130.JPG",
        category: "purim",
        availableInRegions: ["Israel"],
        warning: "Items and packaging may vary based on availability",
      },
    };

    return allItems; // Return all items if not in the US region
  }, [exchangeRate, shopRegion]);

  const selectedItem = items[purimId];

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [trendingQuantity, setTrendingQuantity] = useState(1);
  const [showTrendingPopup, setShowTrendingPopup] = useState(true);

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...selectedItem,
      quantity,
    };

    addToCart(itemToAdd);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart("hide"), 1500);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleTrendingAdd = () => {
    const kidsSpecial = items['kidsSpecial'];
    addToCart({
      ...kidsSpecial,
      quantity: trendingQuantity
    });
    setTrendingQuantity(1);
  };

  // Determine if the item is available in the current region
  const isAvailableInRegion =
    selectedItem?.availableInRegions.includes(shopRegion);

  return (
    <div className="purim-detail">
      <img
        src={selectedItem?.imageUrl}
        alt={selectedItem?.title}
        className="purim-image"
      />
      <h2 className="purim-title">{selectedItem?.title}</h2>
      <p className="purim-description">{selectedItem?.description}</p>
      {selectedItem?.warning && (
        <p className="purim-warning">{selectedItem?.warning}</p>
      )}
      <div className="purim-price">
        {currency === "Dollar"
          ? `$${selectedItem?.priceDollar}`
          : `₪${selectedItem?.priceShekel}`}
      </div>
      <QuantitySelector
        quantity={quantity}
        handleQuantityChange={handleQuantityChange}
      />

      <Notification addedToCart={addedToCart} />
      {!addedToCart && (
        <button
          onClick={!selectedItem.isSoldOut && handleAddToCart}
          className="add-to-cart-btn"
          disabled={!isAvailableInRegion || selectedItem.isSoldOut}
          title={
            !isAvailableInRegion
              ? "This item is only available in Israel"
              : selectedItem.isSoldOut
                ? "This item is sold out."
                : ""
          }
        >
          {selectedItem.isSoldOut ? "Sold Out" : "Add to Cart"}
        </button>
      )}

      {/* Add trending popup (only show if current item is not kids special) */}
      {purimId !== 'kidsSpecial' && showTrendingPopup && (
        <div className="trending-popup">
          <div className="trending-content">
            <button 
              className="close-trending-btn"
              onClick={() => setShowTrendingPopup(false)}
            >
              ×
            </button>
            <h4>Trending Now! 🔥</h4>
            <img
              src="/Kids Special back $10.jpg"
              alt="Kids Special Package"
              className="trending-image"
            />
            <h5>Kids Special</h5>
            <p className="trending-price">
              {currency === "Dollar" ? "$10" : `₪${calculatePriceInShekels(10)}`}
            </p>
            <select
              value={trendingQuantity}
              onChange={(e) => setTrendingQuantity(Number(e.target.value))}
              className="trending-quantity"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <button
              onClick={handleTrendingAdd}
              className="trending-add-btn"
            >
              Add to my order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurimDetail;
