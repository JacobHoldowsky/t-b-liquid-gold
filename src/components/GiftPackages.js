import React from "react";
import { Link } from "react-router-dom";
import "./GiftPackages.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";

function GiftPackages({ cart, addToCart }) {
  const { currency } = React.useContext(CurrencyContext);
  const exchangeRate = React.useContext(ExchangeRateContext);

  const items = [
    {
      url: "For Him $55.jpg",
      title: "For Him",
      priceDollar: 55,
      id: "forHim",
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
    },
    {
      url: "For Her $55.jpg",
      title: "For Her",
      priceDollar: 55,
      id: "forHer",
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
    },
    {
      url: "setOfFour.jpg",
      title: "Set of Four",
      priceDollar: 58,
      id: "setOfFour",
      priceShekel: exchangeRate
        ? Math.ceil(58 * exchangeRate)
        : Math.ceil(58 * 3.7),
    },
    {
      url: "chocolateDelight.png",
      title: "Chocolate Delight",
      priceDollar: 65,
      id: "chocolateDelight",
      priceShekel: exchangeRate
        ? Math.ceil(65 * exchangeRate)
        : Math.ceil(65 * 3.7),
    },
    {
      url: "tnbCollection.jpg",
      title: "T&Bee Collection",
      priceDollar: 79,
      id: "tnBeeCollection",
      priceShekel: exchangeRate
        ? Math.ceil(79 * exchangeRate)
        : Math.ceil(79 * 3.7),
    },
    {
      url: "aLaConnoisseur.jpg",
      title: "A' LA Connoisseur",
      priceDollar: 85,
      id: "aLaConnoisseur",
      priceShekel: exchangeRate
        ? Math.ceil(85 * exchangeRate)
        : Math.ceil(85 * 3.7),
    },
    {
      url: "Belgian Box $100.jpg",
      title: "Belgian Box",
      priceDollar: 100,
      id: "belgianBox",
      priceShekel: exchangeRate
        ? Math.ceil(100 * exchangeRate)
        : Math.ceil(100 * 3.7),
    },
    {
      url: "Collection Plus $95.jpg",
      title: "Collection Plus",
      priceDollar: 105,
      id: "collectionPlus",
      priceShekel: exchangeRate
        ? Math.ceil(105 * exchangeRate)
        : Math.ceil(105 * 3.7),
    },
    {
      url: "Deluxe Box $120.jpg",
      title: "Deluxe Box",
      priceDollar: 120,
      id: "deluxeBox",
      priceShekel: exchangeRate
        ? Math.ceil(120 * exchangeRate)
        : Math.ceil(120 * 3.7),
    },
  ];

  console.log(items[0].url)

  return (
    <div className="gift-packages">
      <div className="banner">
        <p>
          All gift packages will be delivered the week of September 29th, 2024.
          If you need a specific delivery date outside of this week, please
          contact us directly.
        </p>
      </div>
      <h2 className="gift-packages-section-title">Gift Packages</h2>
      <div className="gift-packages-images">
        {items.map((item, index) => (
          <div key={index} className="gift-packages-div">
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
                  : `₪
                  id: 'forHim',${item.priceShekel}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GiftPackages;
