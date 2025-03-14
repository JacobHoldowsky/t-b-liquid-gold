import React, { useContext, useState, useEffect, useMemo } from "react";
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
  const { shopRegion } = useShopContext();
  const exchangeRate = useContext(ExchangeRateContext);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        url: "teaParty.jpg",
        title: "Tea Party",
        priceDollar: 35,
        id: "teaParty",
        priceShekel: calculatePriceInShekels(35, exchangeRate),
      },
      {
        url: "israelsGold.jpg",
        title: "Israel's Gold",
        priceDollar: 70,
        id: "israelsGold",
        priceShekel: calculatePriceInShekels(70, exchangeRate),
      },
      {
        url: "lchaim.jpg",
        title: "Lchaim Board",
        priceDollar: 130,
        id: "lchaim",
        priceShekel: calculatePriceInShekels(130, exchangeRate),
      },
      {
        url: "honeyALaConnoisseur.jpg",
        title: "Honey A' La Connoisseur",
        priceDollar: 80,
        id: "HoneyALaConnoisseur",
        priceShekel: calculatePriceInShekels(80, exchangeRate),
      },
      {
        url: "whiskeyNChocolates.jpg",
        title: "Whiskey n' Chocolates",
        priceDollar: 105,
        id: "whiskeyNChocolates",
        priceShekel: calculatePriceInShekels(105, exchangeRate),
      },

      {
        url: "familyFun.jpg",
        title: "Family Fun",
        priceDollar: 100,
        id: "familyFun",
        priceShekel: calculatePriceInShekels(100, exchangeRate),
      },
      {
        url: "scotchAndPop.jpg",
        title: "Scotch n' Pop",
        priceDollar: 165,
        id: "scotchNPop",
        priceShekel: calculatePriceInShekels(165, exchangeRate),
      },
      // {
      //   url: "kidsSpecialFront.jpg",
      //   title: "Kids Special",
      //   priceDollar: 10,
      //   id: "kidsSpecial",
      //   priceShekel: calculatePriceInShekels(10, exchangeRate),
      // },
      {
        url: "noshBox.jpg",
        title: "Nosh Box",
        priceDollar: 35,
        id: "noshBox",
        priceShekel: calculatePriceInShekels(35, exchangeRate),
      },
      {
        url: "bochurBox.jpg",
        title: "Jerky Box",
        priceDollar: 55,
        id: "jerkyBox",
        priceShekel: calculatePriceInShekels(55, exchangeRate),
      },
      {
        url: "signatureBoard.jpg",
        title: "Signature Board",
        priceDollar: 60,
        id: "signatureBoard",
        priceShekel: calculatePriceInShekels(60, exchangeRate),
      },
      {
        url: "soldierFamilySpecial.png",
        title: "Soldier Family Special",
        priceDollar: 25,
        id: "soldierFamilySpecial",
        priceShekel: calculatePriceInShekels(25, exchangeRate),
      },
    ];

    // Sort items from most expensive to least expensive, regardless of screen size
    return [...allItems].sort((a, b) => b.priceDollar - a.priceDollar);
  }, [exchangeRate, shopRegion, isMobile]);

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
