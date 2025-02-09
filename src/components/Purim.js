import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Purim.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

// Reusable Component for Each Gift Package Item
const PurimItem = ({ item, currency }) => (
  <div className="gift-packages-div">
    <div className="gift-packages-image">
      <Link to={`/purim/${item.id}`}>
        <img src={item.url} alt={item.title} />
      </Link>
    </div>
    <div className="gift-packages-info">
      <h3>{item.title}</h3>
      <p>
        {currency === "Dollar"
          ? `$${item.priceDollar}`
          : `₪${item.priceShekel}`}
      </p>
    </div>
  </div>
);

// Helper function to calculate price in Shekels
const calculatePriceInShekels = (priceDollar, exchangeRate) => {
  return exchangeRate
    ? Math.ceil(priceDollar * exchangeRate)
    : Math.ceil(priceDollar * 3.7);
};

function Purim({ cart, addToCart }) {
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Memoize the items list to prevent unnecessary re-calculations on every render
  const items = useMemo(() => {
    const allItems = [
      {
        url: "Kids Special $10.jpg",
        title: "Kids Special",
        priceDollar: 10,
        id: "kidsSpecial",
        priceShekel: calculatePriceInShekels(10, exchangeRate),
      },
      {
        url: "Tea Party $25.jpg",
        title: "Tea Party",
        priceDollar: 25,
        id: "teaParty",
        priceShekel: calculatePriceInShekels(25, exchangeRate),
      },
      {
        url: "Nosh Box $30.jpg",
        title: "Nosh Box",
        priceDollar: 30,
        id: "noshBox",
        priceShekel: calculatePriceInShekels(30, exchangeRate),
      },
      {
        url: "Bochur Box $45.jpg",
        title: "Bochur Box",
        priceDollar: 45,
        id: "bochurBox",
        priceShekel: calculatePriceInShekels(45, exchangeRate),
      },
      {
        url: "Israel's Gold $65.jpg",
        title: "Israel's Gold",
        priceDollar: 65,
        id: "israelsGold",
        priceShekel: calculatePriceInShekels(65, exchangeRate),
      },
      {
        url: "Whiskey n' Chocolates $85.jpg",
        title: "Whiskey n' Chocolates",
        priceDollar: 85,
        id: "whiskeyNChocolates",
        priceShekel: calculatePriceInShekels(85, exchangeRate),
      },
      {
        url: "Family Fun $100.JPG",
        title: "Family Fun",
        priceDollar: 100,
        id: "familyFun",
        priceShekel: calculatePriceInShekels(100, exchangeRate),
      },
      {
        url: "Lchaim! $120.jpg",
        title: "Lchaim!",
        priceDollar: 120,
        id: "lchaim",
        priceShekel: calculatePriceInShekels(120, exchangeRate),
      },
      {
        url: "Scotch n' Pop $130.JPG",
        title: "Scotch n' Pop",
        priceDollar: 130,
        id: "scotchNPop",
        priceShekel: calculatePriceInShekels(130, exchangeRate),
      },
    ];

    // Filter items based on the US region
    return allItems
  }, [exchangeRate, shopRegion]);

  return (
    <div className="gift-packages">
      <div className="banner">
        <p>
          Deliveries outside Jerusalem will be done between March 11-14 and in
          Jerusalem will be done between March 11-16
        </p>
      </div>

      <h2 className="gift-packages-section-title">Purim</h2>
      <div className="gift-packages-images">
        {items.map((item) => (
          <PurimItem key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </div>
  );
}

export default Purim;
