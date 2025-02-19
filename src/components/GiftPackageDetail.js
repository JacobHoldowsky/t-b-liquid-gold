import React, { useState, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";
import "./GiftPackageDetail.css";
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

// Add this new component near the top of the file, after other component imports
const ImageCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="image-carousel">
      <img src={images[currentIndex]} alt={`${title} - Image ${currentIndex + 1}`} className="gift-package-image" />
      {images.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={prevImage}>
            <span className="arrow-icon">‹</span>
          </button>
          <button className="carousel-btn next" onClick={nextImage}>
            <span className="arrow-icon">›</span>
          </button>
        </>
      )}
    </div>
  );
};

function GiftPackageDetail({ cart, addToCart }) {
  const { packageId } = useParams();
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Available honey flavors, excluding Bourbon Creamed Honey if region is US
  const honeyFlavors = useMemo(() => {
    const allFlavors = [
      "Chocolate Creamed Honey",
      "Cinnamon Creamed Honey",
      "Pumpkin Creamed Honey",
      "Sea Salt Creamed Honey",
      "Vanilla Creamed Honey",
      "Bourbon Creamed Honey",
      "Blueberry Creamed Honey",
    ];
    // Exclude Bourbon Creamed Honey if region is US
    return shopRegion === "US"
      ? allFlavors.filter((flavor) => flavor !== "Bourbon Creamed Honey")
      : allFlavors;
  }, [shopRegion]);

  // Helper function to calculate price in Shekels
  const calculatePriceInShekels = (priceDollar) =>
    exchangeRate
      ? Math.ceil(priceDollar * exchangeRate)
      : Math.ceil(priceDollar * 3.7);
  // Memoize the items object to prevent unnecessary recalculations
  const items = useMemo(() => {
    const allItems = {
      forHim: {
        title: "For Him",
        description: "2 flavored creamed honeys, moscato, wooden honey dipper.",
        priceDollar: 49,
        priceShekel: calculatePriceInShekels(49),
        honeyCount: 2,
        imageUrl: "/For Him $55-min.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },

      forHer: {
        title: "For Her",
        description: "2 flavored creamed honeys, Rosato, wooden honey dipper",
        priceDollar: 49,
        priceShekel: calculatePriceInShekels(49),
        honeyCount: 2,
        imageUrl: "/For Her $55-min.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
      boxOfFour: {
        title: "Box of Four",
        description:
          "4 flavored creamed honeys wrapped in a beautiful gift box with a wooden honey dipper",
        priceDollar: shopRegion === "US" ? 65 : 55,
        warning:
          shopRegion === "US"
            ? "*This item is available for pickup in Five Towns, Lakewood, or Monsey and does not ship"
            : "",
        priceShekel: calculatePriceInShekels(shopRegion === "US" ? 65 : 55),
        honeyCount: 4,
        imageUrl: "/boxOfFour-min.jpg",
        category: "gift packages",
        availableInRegions: ["Israel", "US"],
      },
      boardOfFour: {
        title: "Board of Four",
        description: "4 flavored creamed honeys on a wooden serving board",
        priceDollar: shopRegion === "US" ? 75 : 60,
        priceShekel: calculatePriceInShekels(shopRegion === "US" ? 75 : 60),
        honeyCount: 4,
        imageUrl: "/Board of Four no plastic-min.jpg",
        category: "gift packages",
        availableInRegions: ["Israel", "US"],
      },
      chocolateDelight: {
        title: "Chocolate Delight",
        description:
          "2 Flavored creamed honeys, 4 Dairy belgian chocolates, wooden honey dipper.",
        priceDollar: 59,
        priceShekel: calculatePriceInShekels(59),
        honeyCount: 2,
        imageUrl: "/chocolateDelight-min.png",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
      tnBeeCollection: {
        title: "T&Bee Collection Box",
        description:
          "6 flavored creamed honeys wrapped in a beautiful gift box with a wooden honey dipper.",
        priceDollar: shopRegion === "US" ? 85 : 79,
        priceShekel: calculatePriceInShekels(shopRegion === "US" ? 85 : 79),
        warning:
          shopRegion === "US"
            ? "*This item is available for pickup in Five Towns, Lakewood, or Monsey and does not ship"
            : "",
        honeyCount: 6,
        imageUrl: "/tnbCollectionBox.jpg",
        category: "gift packages",
        availableInRegions: ["Israel", "US"],
      },
      HoneyALaConnoisseur: {
        title: "Honey A' La Connoisseur",
        description:
          "2 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
        warning: "*Wine bottle will vary based on availability",
        priceDollar: 80,
        priceShekel: calculatePriceInShekels(80),
        honeyCount: 2,
        imageUrl: "/honeyALaConnoisseur.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
      collectionPlusBox: {
        title: "Collection Plus Box",
        description:
          "6 Flavored creamed honeys, 5 Dairy Belgian chocolates, wooden honey dipper.",
        priceDollar: 110,
        priceShekel: calculatePriceInShekels(110),
        honeyCount: 6,
        imageUrl: "/Collection Plus $95-min.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
      honeycombCollectionBoard: {
        title: "Honeycomb Collection Board",
        description:
          "All of our 7 delicious flavored creamed honeys on a wooden serving board.",
        priceDollar: shopRegion === "US" ? 125 : 99,
        priceShekel: calculatePriceInShekels(shopRegion === "US" ? 125 : 99),
        honeyCount: 7,
        imageUrl: "/honeycombCollectionBoard.jpg",
        category: "gift packages",
        availableInRegions: ["Israel", "US"],
        isSoldOut: true,
      },
      belgianBox: {
        title: "Belgian Box",
        description:
          "4 Flavored creamed honeys, 12 Dairy Belgian chocolates, wooden honey dipper.",
        priceDollar: 105,
        priceShekel: calculatePriceInShekels(105),
        honeyCount: 4,
        imageUrl: "/Belgian Box $100-min.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
      deluxeBox: {
        title: "Deluxe Box",
        description:
          "5 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
        warning: "*Wine bottle will vary based on availability",
        priceDollar: 120,
        priceShekel: calculatePriceInShekels(120),
        honeyCount: 5,
        imageUrl: "/Deluxe Box $120-min.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
      deluxeBoard: {
        title: "Deluxe Board",
        description: `5 Flavored creamed honeys, ${
          shopRegion === "US" ? "750ml" : "375ml"
        } bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.`,
        warning: "*Wine bottle will vary based on availability",
        priceDollar: shopRegion === "US" ? 150 : 136,
        priceShekel: calculatePriceInShekels(shopRegion === "US" ? 150 : 136),
        honeyCount: 5,
        images: ["/Deluxe Board no plastic-min.jpg", "/deluxeBoard.png"],
        category: "gift packages",
        availableInRegions: ["Israel", "US"],
      },
      scotchNSweetsBoard: {
        title: "Scotch n' Sweets Board",
        description:
          "4 Flavored creamed honeys, 5 Dairy Belgian chocolates, 700ml Bottle of Glenlivet, wooden honey dipper, wooden honey board.",
        priceDollar: shopRegion === "US" ? 180 : 160,
        priceShekel: calculatePriceInShekels(shopRegion === "US" ? 180 : 160),
        honeyCount: 4,
        imageUrl: "/scoth n sweets-min.png",
        category: "gift packages",
        availableInRegions: ["Israel", "US"],
      },
      theBossBoard: {
        title: "The Boss Board",
        description:
          "6 Flavored creamed honeys, Bottle of wine, 9 Dairy Belgian chocolates, Wooden honey dipper, Wooden serving board.",
        warning: "*Wine bottle will vary based on availability",
        priceDollar: 180,
        priceShekel: calculatePriceInShekels(180),
        honeyCount: 6,
        imageUrl: "/theBossBoard.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
      },
    };

    return allItems; // Return all items if not in the US region
  }, [exchangeRate, shopRegion]);

  const selectedItem = items[packageId];
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
    const isHoneycombCollectionBoard = packageId === "honeycombCollectionBoard";
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
      <ImageCarousel 
        images={selectedItem?.images || [selectedItem?.imageUrl]} 
        title={selectedItem?.title}
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
          onClick={!selectedItem.isSoldOut && handleAddToCart}
          className="add-to-cart-btn"
          disabled={!isAvailableInRegion || selectedItem.isSoldOut}
          title={
            !isAvailableInRegion
              ? "This item is only available in Israel"
              : selectedItem.isSoldOut
                ? "This item is sold out."
                : ""
          }
        >
          {selectedItem.isSoldOut ? "Sold Out" : "Add to Cart"}
        </button>
      )}
    </div>
  );
}

export default GiftPackageDetail;
