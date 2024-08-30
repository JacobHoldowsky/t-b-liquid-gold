import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";
import "./GiftPackageDetail.css";

function GiftPackageDetail({ cart, addToCart }) {
  const { packageId } = useParams();
  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);

  const items = {
    forHim: {
      title: "For Him",
      description: "2 flavored creamed honeys, moscato, wooden honey dipper.",
      priceDollar: 49,
      priceShekel: exchangeRate
        ? Math.ceil(49 * exchangeRate)
        : Math.ceil(49 * 3.7),
      honeyCount: 2,
      imageUrl: "/For Him $55-min.jpg",
    },
    forHer: {
      title: "For Her",
      description: "2 flavored creamed honeys, Rosato, wooden honey dipper",
      priceDollar: 49,
      priceShekel: exchangeRate
        ? Math.ceil(49 * exchangeRate)
        : Math.ceil(49 * 3.7),
      honeyCount: 2,
      imageUrl: "/For Her $55-min.jpg",
    },
    boxOfFour: {
      title: "Box of Four",
      description:
        "4 flavored creamed honeys wrapped in a beautiful gift box with a wooden honey dipper",
      priceDollar: 55,
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
      honeyCount: 4,
      imageUrl: "/boxOfFour-min.jpg",
    },
    boardOfFour: {
      title: "Board of Four",
      description: "4 flavored creamed honeys on a wooden serving board",
      priceDollar: 58,
      priceShekel: exchangeRate
        ? Math.ceil(58 * exchangeRate)
        : Math.ceil(58 * 3.7),
      honeyCount: 4,
      imageUrl: "/Board of Four no plastic-min.jpg",
    },
    chocolateDelight: {
      title: "Chocolate Delight",
      description:
        "2 Flavored creamed honeys, 4 Dairy belgian chocolates, wooden honey dipper.",
      priceDollar: 59,
      priceShekel: exchangeRate
        ? Math.ceil(59 * exchangeRate)
        : Math.ceil(59 * 3.7),
      honeyCount: 2,
      imageUrl: "/chocolateDelight-min.png",
    },
    tnBeeCollection: {
      title: "T&Bee Collection Box",
      description:
        "6 flavored creamed honeys wrapped in a beautiful gift box with a wooden honey dipper.",
      priceDollar: 79,
      priceShekel: exchangeRate
        ? Math.ceil(79 * exchangeRate)
        : Math.ceil(79 * 3.7),
      honeyCount: 6,
      imageUrl: "/tnbCollection-min.jpg",
    },
    HoneyALaConnoisseur: {
      title: "Honey A' La Connoissuer",
      description:
        "2 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
      warning: "*Wine may vary based on availability",
      priceDollar: 85,
      priceShekel: exchangeRate
        ? Math.ceil(85 * exchangeRate)
        : Math.ceil(85 * 3.7),
      honeyCount: 2,
      imageUrl: "/aLaConnoisseur-min.jpg",
    },
    collectionPlusBox: {
      title: "Collection Plus Box",
      description:
        "6 Flavored creamed honeys, 5 Dairy Belgian chocolates, wooden honey dipper.",
      priceDollar: 95,
      priceShekel: exchangeRate
        ? Math.ceil(95 * exchangeRate)
        : Math.ceil(95 * 3.7),
      honeyCount: 6,
      imageUrl: "/Collection Plus $95-min.jpg",
    },
    honeycombCollectionBoard: {
      title: "Honeycomb Collection Board",
      description:
        "All of our 7 delicious flavored creamed honeys on a wooden serving board.",
      priceDollar: 99,
      priceShekel: exchangeRate
        ? Math.ceil(99 * exchangeRate)
        : Math.ceil(99 * 3.7),
      honeyCount: 7,
      imageUrl: "/Honeycomb collection board no plastic-min.jpg",
    },
    belgianBox: {
      title: "Belgian Box",
      description:
        "4 Flavored creamed honeys, 12 Dairy Belgian chocolates, wooden honey dipper.",
      priceDollar: 105,
      priceShekel: exchangeRate
        ? Math.ceil(105 * exchangeRate)
        : Math.ceil(105 * 3.7),
      honeyCount: 4,
      imageUrl: "/Belgian Box $100-min.jpg",
    },
    deluxeBox: {
      title: "Deluxe Box",
      description:
        "5 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
      warning: "*Wine may vary based on availability",
      priceDollar: 120,
      priceShekel: exchangeRate
        ? Math.ceil(120 * exchangeRate)
        : Math.ceil(120 * 3.7),
      honeyCount: 5,
      imageUrl: "/Deluxe Box $120-min.jpg",
    },
    deluxeBoard: {
      title: "Deluxe Board",
      description:
        "5 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
      warning: "*Wine may vary based on availability",
      priceDollar: 136,
      priceShekel: exchangeRate
        ? Math.ceil(136 * exchangeRate)
        : Math.ceil(136 * 3.7),
      honeyCount: 5,
      imageUrl: "/Deluxe Board no plastic-min.jpg",
    },
    scotchNSweetsBoard: {
      title: "Scotch n' Sweets Board",
      description:
        "4 Flavored creamed honeys, 5 Dairy Belgian chocolates, 700ml Bottle of Glenlivet, wooden honey dipper, wooden honey board.",
      priceDollar: 160,
      priceShekel: exchangeRate
        ? Math.ceil(160 * exchangeRate)
        : Math.ceil(160 * 3.7),
      honeyCount: 4,
      imageUrl: "/scoth n sweets-min.png",
    },
    theBossBoard: {
      title: "The Boss Board",
      description:
        "6 Flavored creamed honeys, Bottle of wine, 9 Dairy Belgian chocolates, Wooden honey dipper, Wooden serving board.",
      warning: "*Wine may vary based on availability",
      priceDollar: 180,
      priceShekel: exchangeRate
        ? Math.ceil(180 * exchangeRate)
        : Math.ceil(180 * 3.7),
      honeyCount: 6,
      imageUrl: "/The Boss Board no plastic-min.jpg",
    },
  };

  const selectedItem = items[packageId];
  const [selectedFlavors, setSelectedFlavors] = useState(
    Array(selectedItem.honeyCount).fill("Chocolate Creamed Honey")
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
    // Check if the selected item is the Honeycomb Collection Board
    const isHoneycombCollectionBoard = packageId === "honeycombCollectionBoard";

    // Set all available flavors for Honeycomb Collection Board
    const honeycombFlavors = [
      "Chocolate Creamed Honey",
      "Cinnamon Creamed Honey",
      "Pumpkin Creamed Honey",
      "Sea Salt Creamed Honey",
      "Vanilla Creamed Honey",
      "Bourbon Creamed Honey",
      "Blueberry Creamed Honey",
    ];

    const itemToAdd = {
      ...selectedItem,
      selectedFlavors: isHoneycombCollectionBoard
        ? honeycombFlavors
        : selectedFlavors,
      quantity,
    };

    addToCart(itemToAdd);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart("hide"), 1500);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="gift-package-detail">
      <img
        src={selectedItem.imageUrl}
        alt={selectedItem.title}
        className="gift-package-image"
      />
      <h2 className="gift-package-title">{selectedItem.title}</h2>
      <p className="gift-package-description">{selectedItem.description}</p>
      {selectedItem.warning && (
        <p className="gift-package-warning">{selectedItem.warning}</p>
      )}
      <div className="gift-package-price">
        {currency === "Dollar"
          ? `$${selectedItem.priceDollar}`
          : `₪${selectedItem.priceShekel}`}
      </div>
      <div className="quantity-selector">
        <label htmlFor="quantity">Quantity:</label>
        <select
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
          className="select-dropdown"
        >
          {[...Array(10).keys()].map((num) => (
            <option key={num + 1} value={num + 1}>
              {num + 1}
            </option>
          ))}
        </select>
      </div>
      {selectedItem.honeyCount !== 7 && (
        <div className="honey-flavor-selector">
          {selectedFlavors.map((flavor, index) => (
            <div key={index} className="honey-flavor-dropdown">
              <label htmlFor={`flavor-${index}`}>
                Honey Flavor {index + 1}:
              </label>
              <select
                id={`flavor-${index}`}
                value={flavor}
                onChange={(e) => handleFlavorChange(index, e.target.value)}
              >
                <option value="Chocolate Creamed Honey">
                  Chocolate Creamed Honey
                </option>
                <option value="Cinnamon Creamed Honey">
                  Cinnamon Creamed Honey
                </option>
                <option value="Pumpkin Creamed Honey">
                  Pumpkin Creamed Honey
                </option>
                <option value="Sea Salt Creamed Honey">
                  Sea Salt Creamed Honey
                </option>
                <option value="Vanilla Creamed Honey">
                  Vanilla Creamed Honey
                </option>
                <option value="Bourbon Creamed Honey">
                  Bourbon Creamed Honey
                </option>
                <option value="Blueberry Creamed Honey">
                  Blueberry Creamed Honey
                </option>
              </select>
            </div>
          ))}
        </div>
      )}
      {addedToCart ? (
        <div
          className={`notification ${addedToCart === "hide" ? "hide" : "show"}`}
        >
          <FaCheckCircle className="checkmark" />
          Added to cart
        </div>
      ) : (
        <button onClick={handleAddToCart} className="add-to-cart-btn">
          Add to Cart
        </button>
      )}
    </div>
  );
}

export default GiftPackageDetail;
