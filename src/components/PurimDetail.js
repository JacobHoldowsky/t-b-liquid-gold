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
      teaParty: {
        title: "Tea Party",
        description: "1 Flavored creamed honey, 4 lotus cookies, 5 tea packets, and a wooden honey dipper.",
        priceDollar: 30,
        priceShekel: calculatePriceInShekels(30),
        imageUrl: "/teaParty.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      israelsGold: {
        title: "Israel's Gold",
        description: "2 Flavored creamed honeys, 200ml Blue Nun, Schmerling chocolate (Dairy), and a wooden honey dipper.",
        priceDollar: 70,
        priceShekel: calculatePriceInShekels(70),
        imageUrl: "/israelsGold.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      lchaim: {
        title: "Lchaim!",
        description: "375ml Bottle of wine and 18 Praline Chocolates (Dairy).",
        priceDollar: 110,
        priceShekel: calculatePriceInShekels(110),
        imageUrl: "/lchaim.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      whiskeyNChocolates: {
        title: "Whiskey n' Chocolates",
        description: "375ml Jack Daniels and 12 Praline chocolates (Dairy).",
        priceDollar: 105,
        priceShekel: calculatePriceInShekels(105),
        imageUrl: "/Whiskey n' Chocolates $85.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      HoneyALaConnoisseur: {
        title: "Honey A' La Connoisseur",
        description:
          "2 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
        warning: "*Wine bottle will vary based on availability",
        priceDollar: 80,
        priceShekel: calculatePriceInShekels(80),
        honeyCount: 2,
        imageUrl: "/honeyALaConnoisseur.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
      familyFun: {
        title: "Family Fun",
        description: "750ml bottle of wine, Box of Gushers, Twizzlers, Mentos, Mike n' Ikes, 5 Praline chocolates (Dairy), Purim chocolates, and Crackers.",
        priceDollar: 100,
        priceShekel: calculatePriceInShekels(100),
        imageUrl: "/familyFun.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      scotchNPop: {
        title: "Scotch n' Pop",
        description: "750ml Glenlivet, 2 Bags flavored popcorn, and 12 Praline chocolates (Dairy).",
        priceDollar: 145,
        priceShekel: calculatePriceInShekels(145),
        imageUrl: "/scotchAndPop.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      kidsSpecial: {
        title: "Kids Special",
        description: "Chip bag, oodles, fruit nuggets, lolly fizz, candy spinner, and chocolate bar (Dairy).",
        priceDollar: 10,
        priceShekel: calculatePriceInShekels(10),
        imageUrl: "/kidsSpecialBack.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      noshBox: {
        title: "Nosh Box",
        description: "2 Snack bags, Mike N' Ikes, Gushers, chocolate bar (Dairy), Clicks (Dairy), and Mints/gum.",
        priceDollar: 30,
        priceShekel: calculatePriceInShekels(30),
        imageUrl: "/noshBox.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
      },
      bochurBox: {
        title: "Bochur Box",
        description: "Beef Jerky, Oreos, Coke, Pringles, Mike n' Ikes, and Snacks bag.",
        priceDollar: 45,
        priceShekel: calculatePriceInShekels(45),
        imageUrl: "/bochurBox.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
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
              src="/kidsSpecialBack.jpg"
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
