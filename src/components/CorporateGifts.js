import React from "react";
import { Link } from "react-router-dom";
import "./CorporateGifts.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";

function CorporateGifts({ cart, addToCart }) {
  const { currency } = React.useContext(CurrencyContext);
  const exchangeRate = React.useContext(ExchangeRateContext);

  const items = [
    {
      url: "miniCollectionBoard.jpeg",
      title: "Mini Collection Board",
      priceDollar: "50",
      id: "miniCollectionBoard",
      priceShekel: exchangeRate
        ? Math.ceil(50 * exchangeRate)
        : Math.ceil(50 * 3.7),
    },
    {
      url: "Deluxe Box $120.jpg",
      title: "Deluxe Box",
      priceDollar: "120",
      id: "deluxeBox",
      priceShekel: "400",
    },
    {
      url: "Belgian Box $100.jpg",
      title: "Belgian Box",
      priceDollar: "100",
      id: "belgianBox",
      priceShekel: "350",
    },
    {
      url: "For Him $55.jpg",
      title: "For Him",
      priceDollar: "55",
      id: "forHim",
      priceShekel: "200",
    },
    {
      url: "For Her $55.jpg",
      title: "For Her",
      priceDollar: "55",
      id: "forHer",
      priceShekel: "200",
    },
  ];

  return (
    <div className="corporate-gifts">
      <h2 className="corporate-gifts-section-title">Corporate Gifts</h2>
      <div className="corporate-gifts-images">
        {items.map((item, index) => (
          <div key={index} className="corporate-gifts-div">
            <div className="corporate-gifts-image">
              <Link to={`/corporateGifts/${item.id}`}>
                <img src={item.url} alt={item.title} />
              </Link>
            </div>
            <div className="corporate-gifts-info">
              <h3>{item.title}</h3>
              <p>
                {currency === "Dollar"
                  ? `$${item.priceDollar}`
                  : `₪${item.priceShekel}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CorporateGifts;
