import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./SponsorAHoneyBoard.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

// Reusable Component for Each Gift Package Item
const SponsorAHoneyBoardItem = ({ item, currency }) => (
  <div className="gift-packages-div">
    <div className="gift-packages-image">
      <Link to={`/sponsorAHoneyBoard/${item.id}`}>
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

function SponsorAHoneyBoard({ cart, addToCart }) {
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Memoize the items list to prevent unnecessary re-calculations on every render
  const items = useMemo(() => {
    const allItems = [
      {
        url: "sweet-board-min.jpeg",
        title: "Sponsor a Sweet Board",
        priceDollar: 60,
        id: "sponsorASweetBoard",
        priceShekel: calculatePriceInShekels(60, exchangeRate),
      },
      {
        url: "Sponsor a honey board with plastic-min.png",
        title: "Sponsor a Family Board",
        priceDollar: 75,
        id: "sponsorAHoneyBoard",
        priceShekel: calculatePriceInShekels(75, exchangeRate),
      },
    ];

    // Filter items based on the US region
    return allItems;
  }, [exchangeRate, shopRegion]);

  return (
    <div className="sponsor-honey-board-page">
      {/* Introductory Blurb Section */}

      {/* Sponsor Honey Board Items Gallery */}
      <div className="gift-packages">
        <div className="sponsor-boards-blurb">
          <h2>Sponsor a Honey Board</h2>
          <p>
            This year, we have been through very challenging times in Israel.
            Many people are grieving the loss of their loved ones, many are
            anxiously awaiting the return of their loved ones, and many women
            are alone for many months while their husbands are fighting the war.
            We invite you to partner with us and send sweetness and support to
            our brothers in Israel. We created a special board for these
            families to gift them with 5 of our unique flavored creamed honeys
            along with wine and chocolate. Please consider sponsoring a honey
            board, and we will distribute it on your behalf. Thank you for
            helping us spread the sweetness of our honeys to the ones who need
            it most.
          </p>
        </div>
        <h2 className="gift-packages-section-title">
          Choose a Honey Board to Sponsor
        </h2>
        <div className="gift-packages-images">
          {items.map((item) => (
            <SponsorAHoneyBoardItem
              key={item.id}
              item={item}
              currency={currency}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SponsorAHoneyBoard;
