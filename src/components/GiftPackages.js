import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./GiftPackages.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

// Reusable Component for Each Gift Package Item
const GiftPackageItem = ({ item, currency }) => (
  <div className="gift-packages-div">
    <div className="gift-packages-image">
      <Link to={`/giftPackages/${item.id}`}>
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

function GiftPackages({ cart, addToCart }) {
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Memoize the items list to prevent unnecessary re-calculations on every render
  const items = useMemo(() => {
    const allItems = [
      {
        url: "For Him $55-min.jpg",
        title: "For Him",
        priceDollar: 49,
        id: "forHim",
        priceShekel: calculatePriceInShekels(49, exchangeRate),
      },
      {
        url: "For Her $55-min.jpg",
        title: "For Her",
        priceDollar: 49,
        id: "forHer",
        priceShekel: calculatePriceInShekels(49, exchangeRate),
      },
      {
        url: "boxOfFour-min.jpg",
        title: "Box of Four",
        priceDollar: shopRegion === "US" ? 65 : 55,
        id: "boxOfFour",
        priceShekel: calculatePriceInShekels(
          shopRegion === "US" ? 65 : 55,
          exchangeRate
        ),
      },
      {
        url: "Board of Four no plastic-min.jpg",
        title: "Board of Four",
        priceDollar: shopRegion === "US" ? 70 : 58,
        id: "boardOfFour",
        priceShekel: calculatePriceInShekels(
          shopRegion === "US" ? 70 : 58,
          exchangeRate
        ),
      },
      {
        url: "chocolateDelight-min.png",
        title: "Chocolate Delight",
        priceDollar: 59,
        id: "chocolateDelight",
        priceShekel: calculatePriceInShekels(59, exchangeRate),
      },
      {
        url: "tnbCollection-min.jpg",
        title: "T&Bee Collection Box",
        priceDollar: shopRegion === "US" ? 85 : 79,
        id: "tnBeeCollection",
        priceShekel: calculatePriceInShekels(
          shopRegion === "US" ? 85 : 79,
          exchangeRate
        ),
      },
      {
        url: "aLaConnoisseur-min.jpg",
        title: "Honey A' La Connoisseur",
        priceDollar: 85,
        id: "HoneyALaConnoisseur",
        priceShekel: calculatePriceInShekels(85, exchangeRate),
      },
      {
        url: "Collection Plus $95-min.jpg",
        title: "Collection Plus Box",
        priceDollar: 95,
        id: "collectionPlusBox",
        priceShekel: calculatePriceInShekels(95, exchangeRate),
      },
      {
        url: "Honeycomb collection board no plastic-min.jpg",
        title: "Honeycomb Collection Board",
        priceDollar: shopRegion === "US" ? 120 : 99,
        id: "honeycombCollectionBoard",
        priceShekel: calculatePriceInShekels(
          shopRegion === "US" ? 120 : 99,
          exchangeRate
        ),
      },
      {
        url: "Belgian Box $100-min.jpg",
        title: "Belgian Box",
        priceDollar: 105,
        id: "belgianBox",
        priceShekel: calculatePriceInShekels(105, exchangeRate),
      },
      {
        url: "Deluxe Box $120-min.jpg",
        title: "Deluxe Box",
        priceDollar: 120,
        id: "deluxeBox",
        priceShekel: calculatePriceInShekels(120, exchangeRate),
      },
      {
        url: "Deluxe Board no plastic-min.jpg",
        title: "Deluxe Board",
        priceDollar: shopRegion === "US" ? 145 : 136,
        id: "deluxeBoard",
        priceShekel: calculatePriceInShekels(
          shopRegion === "US" ? 140 : 136,
          exchangeRate
        ),
      },
      {
        url: "scoth n sweets-min.png",
        title: "Scotch n' Sweets Board",
        priceDollar: 160,
        id: "scotchNSweetsBoard",
        priceShekel: calculatePriceInShekels(160, exchangeRate),
      },
      {
        url: "The Boss Board no plastic-min.jpg",
        title: "The Boss Board",
        priceDollar: 180,
        id: "theBossBoard",
        priceShekel: calculatePriceInShekels(180, exchangeRate),
      },
    ];

    // Filter items based on the US region
    if (shopRegion === "US") {
      return allItems.filter((item) =>
        [
          "honeycombCollectionBoard",
          "boardOfFour",
          "deluxeBoard",
        ].includes(item.id)
      );
    }

    return allItems; // Return all items if not in the US region
  }, [exchangeRate, shopRegion]);

  return (
    <div className="gift-packages">
      <div className="banner">
        <p>
          All gift packages will be delivered the week of September 29th, 2024.
          If you need a specific delivery date outside of this week, please
          contact us directly.
        </p>
      </div>
      <p className="availability-note">
        **Packaging may vary based on availability**
      </p>
      <h2 className="gift-packages-section-title">Gift Packages</h2>
      <div className="gift-packages-images">
        {items.map((item) => (
          <GiftPackageItem key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </div>
  );
}

export default GiftPackages;
