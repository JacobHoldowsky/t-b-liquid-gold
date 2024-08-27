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
      description:
        "A perfect gift package for him, including two jars of creamed honey.",
      priceDollar: 55,
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
      honeyCount: 2,
      imageUrl: "/For Him $55.jpg",
    },
    forHer: {
      title: "For Her",
      description:
        "A perfect gift package for her, including two jars of creamed honey.",
      priceDollar: 55,
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
      honeyCount: 2,
      imageUrl: "/For Her $55.jpg",
    },
    setOfFour: {
      title: "Set of Four",
      description: "A gift package containing four jars of creamed honey.",
      priceDollar: 58,
      priceShekel: exchangeRate
        ? Math.ceil(58 * exchangeRate)
        : Math.ceil(58 * 3.7),
      honeyCount: 4,
      imageUrl: "/setOfFour.jpg",
    },
    chocolateDelight: {
      title: "Chocolate Delight",
      description: "A delightful gift package with two jars of creamed honey.",
      priceDollar: 65,
      priceShekel: exchangeRate
        ? Math.ceil(65 * exchangeRate)
        : Math.ceil(65 * 3.7),
      honeyCount: 2,
      imageUrl: "/chocolateDelight.png",
    },
    tnBeeCollection: {
      title: "T&Bee Collection",
      description: "A premium collection featuring six jars of creamed honey.",
      priceDollar: 79,
      priceShekel: exchangeRate
        ? Math.ceil(79 * exchangeRate)
        : Math.ceil(79 * 3.7),
      honeyCount: 6,
      imageUrl: "/tnbCollection.jpg",
    },
    aLaConnoisseur: {
      title: "A' LA Connoisseur",
      description: "A connoisseur's choice with two jars of creamed honey.",
      priceDollar: 85,
      priceShekel: exchangeRate
        ? Math.ceil(85 * exchangeRate)
        : Math.ceil(85 * 3.7),
      honeyCount: 2,
      imageUrl: "/aLaConnoisseur.jpg",
    },
    belgianBox: {
      title: "Belgian Box",
      description: "A Belgian box containing four jars of creamed honey.",
      priceDollar: 100,
      priceShekel: exchangeRate
        ? Math.ceil(100 * exchangeRate)
        : Math.ceil(100 * 3.7),
      honeyCount: 4,
      imageUrl: "/Belgian Box $100.jpg",
    },
    collectionPlus: {
      title: "Collection Plus",
      description: "A premium collection with six jars of creamed honey.",
      priceDollar: 105,
      priceShekel: exchangeRate
        ? Math.ceil(105 * exchangeRate)
        : Math.ceil(105 * 3.7),
      honeyCount: 6,
      imageUrl: "/Collection Plus $95.jpg",
    },
    deluxeBox: {
      title: "Deluxe Box",
      description: "A deluxe box featuring six jars of creamed honey.",
      priceDollar: 120,
      priceShekel: exchangeRate
        ? Math.ceil(120 * exchangeRate)
        : Math.ceil(120 * 3.7),
      honeyCount: 6,
      imageUrl: "/Deluxe Box $120.jpg",
    },
  };

  const selectedItem = items[packageId];
  const [selectedFlavors, setSelectedFlavors] = useState(
    Array(selectedItem.honeyCount).fill("Chocolate Creamed Honey")
  );
  const [quantity, setQuantity] = useState(1); // State to track the quantity
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
    const itemToAdd = {
      ...selectedItem,
      selectedFlavors,
      quantity, // Use the selected quantity
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
      <div className="honey-flavor-selector">
        {selectedFlavors.map((flavor, index) => (
          <div key={index} className="honey-flavor-dropdown">
            <label htmlFor={`flavor-${index}`}>Honey Flavor {index + 1}:</label>
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
