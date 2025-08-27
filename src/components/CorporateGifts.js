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
      url: "Mini four collection board with plastic-min.png",
      title: "Mini Four Collection Board",
      priceDollar: 40,
      id: "miniFourCollectionBoard",
      priceShekel: 138,
    },
    {
      url: "Mini six collection board with plastic-min.png",
      title: "Mini Six Collection Board",
      priceDollar: 55,
      id: "miniSixCollectionBoard",
      priceShekel: 190,
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
