import React, { useState, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";
import "./SponsorAHoneyBoardDetail.css";
import QuantitySelector from "./QuantitySelector";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

// Reusable Flavor Selector Component
const FlavorSelector = ({ flavors, selectedFlavors, handleFlavorChange }) => (
  <div className="honey-flavor-selector">
    {selectedFlavors.map((flavor, index) => (
      <div key={index} className="honey-flavor-dropdown">
        <label htmlFor={`flavor-${index}`}>Honey Flavor {index + 1}:</label>
        <select
          id={`flavor-${index}`}
          value={flavor}
          onChange={(e) => handleFlavorChange(index, e.target.value)}
        >
          {flavors.map((flavorOption) => (
            <option key={flavorOption} value={flavorOption}>
              {flavorOption}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
);

// Reusable Notification Component
const Notification = ({ addedToCart }) =>
  addedToCart && (
    <div className={`notification ${addedToCart === "hide" ? "hide" : "show"}`}>
      <FaCheckCircle className="checkmark" />
      Added to cart
    </div>
  );

function SponsorAHoneyBoardDetail({ cart, addToCart }) {
  const { sponsorAHoneyBoardId } = useParams();
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Available honey flavors
  const honeyFlavors = useMemo(
    () => [
      "Chocolate Creamed Honey",
      "Cinnamon Creamed Honey",
      "Pumpkin Creamed Honey",
      "Sea Salt Creamed Honey",
      "Vanilla Creamed Honey",
      "Bourbon Creamed Honey",
      "Blueberry Creamed Honey",
    ],
    []
  );

  // Helper function to calculate price in Shekels
  const calculatePriceInShekels = (priceDollar) =>
    exchangeRate
      ? Math.ceil(priceDollar * exchangeRate)
      : Math.ceil(priceDollar * 3.7);
  // Memoize the items object to prevent unnecessary recalculations
  const items = useMemo(() => {
    const allItems = {
      sponsorASweetBoard: {
        title: "Sponsor a Sweet Board",
        description:
          "3 Flavored creamed honeys, 5 Dairy belgian chocolates, wooden honey dipper.",
        priceDollar: 50,
        priceShekel: calculatePriceInShekels(50),
        honeyCount: 0,
        imageUrl: "/sponsor-a-sweet-board-min.jpg",
        category: "sponsor a board",
        availableInRegions: ["Israel", "US"],
      },

      sponsorAHoneyBoard: {
        title: "Sponsor a Family Board",
        description:
          "5 flavored creamed honeys, Half bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper",
        priceDollar: 75,
        priceShekel: calculatePriceInShekels(75),
        honeyCount: 0,
        imageUrl: "/Sponsor a honey board with plastic-min.png",
        category: "sponsor a board",
        availableInRegions: ["Israel", "US"],
      },
      sponsorAMiniSixCollectionBoard: {
        title: "Sponsor a Mini Six Collection Board",
        description:
          "6 flavored creamed honeys, wooden honey dipper, wooden serving board",
        priceDollar: 50,
        priceShekel: calculatePriceInShekels(50),
        honeyCount: 0,
        imageUrl: "/Mini six collection board with plastic-min.png",
        category: "sponsor a board",
        availableInRegions: ["Israel", "US"],
      },
    };

    return allItems;
  }, [exchangeRate, shopRegion]);

  const selectedItem = items[sponsorAHoneyBoardId];
  const [selectedFlavors, setSelectedFlavors] = useState(
    Array(selectedItem?.honeyCount).fill("Chocolate Creamed Honey")
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleFlavorChange = (index, flavor) => {
    const newFlavors = [...selectedFlavors];
    newFlavors[index] = flavor;
    setSelectedFlavors(newFlavors);
  };

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = () => {
    const isHoneycombCollectionBoard =
      sponsorAHoneyBoardId === "honeycombCollectionBoard";
    const itemToAdd = {
      ...selectedItem,
      selectedFlavors: isHoneycombCollectionBoard
        ? honeyFlavors
        : selectedFlavors,
      quantity,
    };

    addToCart(itemToAdd);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart("hide"), 1500);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Determine if the item is available in the current region
  const isAvailableInRegion =
    selectedItem?.availableInRegions.includes(shopRegion);

  return (
    <div className="gift-package-detail">
      <img
        src={selectedItem?.imageUrl}
        alt={selectedItem?.title}
        className="gift-package-image"
      />
      <h2 className="gift-package-title">{selectedItem?.title}</h2>
      <p className="gift-package-description">{selectedItem?.description}</p>
      {selectedItem?.warning && (
        <p className="gift-package-warning">{selectedItem?.warning}</p>
      )}
      <div className="gift-package-price">
        {currency === "Dollar"
          ? `$${selectedItem?.priceDollar}`
          : `₪${selectedItem?.priceShekel}`}
      </div>
      <QuantitySelector
        quantity={quantity}
        handleQuantityChange={handleQuantityChange}
      />
      {selectedItem?.honeyCount !== 7 && (
        <FlavorSelector
          flavors={honeyFlavors}
          selectedFlavors={selectedFlavors}
          handleFlavorChange={handleFlavorChange}
        />
      )}
      <Notification addedToCart={addedToCart} />
      {!addedToCart && (
        <button
          onClick={handleAddToCart}
          className="add-to-cart-btn"
          disabled={!isAvailableInRegion}
          title={
            !isAvailableInRegion
              ? "This item is only available for Israel shipping"
              : ""
          }
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

export default SponsorAHoneyBoardDetail;
