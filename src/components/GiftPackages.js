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
      priceDollar: 49,
      id: "forHim",
      priceShekel: exchangeRate
        ? Math.ceil(49 * exchangeRate)
        : Math.ceil(49 * 3.7),
    },
    {
      url: "For Her $55.jpg",
      title: "For Her",
      priceDollar: 49,
      id: "forHer",
      priceShekel: exchangeRate
        ? Math.ceil(49 * exchangeRate)
        : Math.ceil(49 * 3.7),
    },
    {
      url: "boxOfFour.jpg",
      title: "Box of Four",
      priceDollar: 55,
      id: "boxOfFour",
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
    },
    {
      url: "Board of Four no plastic.jpg",
      title: "Board of Four",
      priceDollar: 58,
      id: "boardOfFour",
      priceShekel: exchangeRate
        ? Math.ceil(58 * exchangeRate)
        : Math.ceil(58 * 3.7),
    },
    {
      url: "chocolateDelight.png",
      title: "Chocolate Delight",
      priceDollar: 59,
      id: "chocolateDelight",
      priceShekel: exchangeRate
        ? Math.ceil(59 * exchangeRate)
        : Math.ceil(59 * 3.7),
    },
    {
      url: "tnbCollection.jpg",
      title: "T&Bee Collection Box",
      priceDollar: 79,
      id: "tnBeeCollection",
      priceShekel: exchangeRate
        ? Math.ceil(79 * exchangeRate)
        : Math.ceil(79 * 3.7),
    },
    {
      url: "aLaConnoisseur.jpg",
      title: "Honey A' La Connoissuer",
      priceDollar: 85,
      id: "HoneyALaConnoisseur",
      priceShekel: exchangeRate
        ? Math.ceil(85 * exchangeRate)
        : Math.ceil(85 * 3.7),
    },
    {
      url: "Collection Plus $95.jpg",
      title: "Collection Plus Box",
      priceDollar: 95,
      id: "collectionPlusBox",
      priceShekel: exchangeRate
        ? Math.ceil(95 * exchangeRate)
        : Math.ceil(95 * 3.7),
    },
    {
      url: "Honeycomb collection board no plastic.jpg",
      title: "Honeycomb Collection Board",
      priceDollar: 99,
      id: "honeycombCollectionBoard",
      priceShekel: exchangeRate
        ? Math.ceil(99 * exchangeRate)
        : Math.ceil(99 * 3.7),
    },
    {
      url: "Belgian Box $100.jpg",
      title: "Belgian Box",
      priceDollar: 105,
      id: "belgianBox",
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
    {
      url: "Deluxe Board no plastic.jpg",
      title: "Deluxe Board",
      priceDollar: 136,
      id: "deluxeBoard",
      priceShekel: exchangeRate
        ? Math.ceil(136 * exchangeRate)
        : Math.ceil(136 * 3.7),
    },
    {
      url: "The Boss Board no plastic.jpg",
      title: "The Boss Board",
      priceDollar: 180,
      id: "theBossBoard",
      priceShekel: exchangeRate
        ? Math.ceil(180 * exchangeRate)
        : Math.ceil(180 * 3.7),
    },
  ];

  console.log(items[0].url);

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
