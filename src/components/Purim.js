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
        <img
          src={item.url}
          alt={item.title}
        />
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
        url: "Tea Party $25.jpg",
        title: "Tea Party",
        priceDollar: 30,
        id: "teaParty",
        priceShekel: calculatePriceInShekels(30, exchangeRate),
      },
      {
        url: "Israel's Gold $65.jpg",
        title: "Israel's Gold",
        priceDollar: 70,
        id: "israelsGold",
        priceShekel: calculatePriceInShekels(70, exchangeRate),
      },
      {
        url: "aLaConnoisseur-min.jpg",
        title: "Honey A' La Connoisseur",
        priceDollar: 80,
        id: "HoneyALaConnoisseur",
        priceShekel: calculatePriceInShekels(80, exchangeRate),
      },
      {
        url: "Lchaim! $120.jpg",
        title: "Lchaim!",
        priceDollar: 110,
        id: "lchaim",
        priceShekel: calculatePriceInShekels(110, exchangeRate),
      },
      {
        url: "Whiskey n' Chocolates $85.jpg",
        title: "Whiskey n' Chocolates",
        priceDollar: 105,
        id: "whiskeyNChocolates",
        priceShekel: calculatePriceInShekels(105, exchangeRate),
      },

      {
        url: "Family Fun $100.JPG",
        title: "Family Fun",
        priceDollar: 100,
        id: "familyFun",
        priceShekel: calculatePriceInShekels(100, exchangeRate),
      },
      {
        url: "Scotch n' Pop $130.JPG",
        title: "Scotch n' Pop",
        priceDollar: 145,
        id: "scotchNPop",
        priceShekel: calculatePriceInShekels(145, exchangeRate),
      },
      {
        url: "Kids Special $10.jpg",
        title: "Kids Special",
        priceDollar: 10,
        id: "kidsSpecial",
        priceShekel: calculatePriceInShekels(10, exchangeRate),
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
    ];

    // Filter items based on the US region
    return allItems
  }, [exchangeRate, shopRegion]);

  return (
    <div className="gift-packages">
      <div className="banner">
        <p>
          All Jerusalem deliveries will be done between March 11-16. All outside Jerusalem deliveries will be done between March 11-14
        </p>

      </div>
      <p className="availability-note">
        **Items and packaging may vary based on availability**
      </p>

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
