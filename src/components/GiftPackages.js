import React, { useState, useContext, useMemo } from "react";

import "./GiftPackages.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check
import { FaCheckCircle } from "react-icons/fa";

/* Reuse the same quantity UI pattern as HoneyCollection */
const QuantitySelector = ({ id, value, onChange }) => (
  <select className="select-dropdown" id={id} value={value} onChange={onChange}>
    {[...Array(10).keys()].map((num) => (
      <option key={num + 1} value={num + 1}>
        {num + 1}
      </option>
    ))}
  </select>
);

// Reusable Flavor Selector (copies the API from GiftPackageDetail)
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

/* Keep item card minimal; click image to open the modal */
const GiftPackageItem = ({ item, currency, openModal }) => (
  <div className="gift-packages-div">
    <div className="gift-packages-image">
      <img
        src={item.url}
        alt={item.title}
        onClick={() => openModal(item)}
        style={{ cursor: "pointer" }}
      />
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

function GiftPackages({ cart, addToCart }) {
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Available honey flavors, excluding Bourbon in US
  const honeyFlavors = useMemo(() => {
    const all = [
      "Chocolate Creamed Honey",
      "Cinnamon Creamed Honey",
      "Pumpkin Creamed Honey",
      "Sea Salt Creamed Honey",
      "Vanilla Creamed Honey",
      "Bourbon Creamed Honey",
      // "Blueberry Creamed Honey",
      "Strawberry Creamed Honey",
    ];
    return all;
  }, [shopRegion]);

  // How many honey choices each package needs (matches GiftPackageDetail)
  const honeyCountById = {
    forHim: 2,
    forHer: 2,
    boxOfFour: 4,
    boardOfFour: 4,
    chocolateDelight: 2,
    tnBeeCollection: 6,
    HoneyALaConnoisseur: 2,
    collectionPlusBox: 6,
    honeycombCollectionBoard: 7, // special: auto-select all flavors, no dropdowns
    belgianBox: 4,
    deluxeBox: 5,
    // deluxeBoard: 5,
    scotchNSweetsBoard: 4,
    theBossBoard: 6,
    beeCaring: 4,
    beeKind: 4,
    deluxeBoard: 5,
  };

  /* NEW: modal + cart notification state (mirrors HoneyCollection) */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [selectedFlavors, setSelectedFlavors] = useState([]);

  const handleFlavorChange = (index, flavor) => {
    const arr = [...selectedFlavors];
    arr[index] = flavor;
    setSelectedFlavors(arr);
  };

  const CHOSEN_EXCHANGE_RATE = 3.5;

  // Memoize the items list to prevent unnecessary re-calculations on every render
  const items = useMemo(() => {
    const allItems = [
      {
        url: "For Him $55-min.jpg",
        title: "For Him",
        description: "2 flavored creamed honeys, moscato, wooden honey dipper.",
        priceDollar: 55,
        id: "forHim",
        priceShekel: shopRegion === "US" ? 190 : Math.ceil(55 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "For Her $55-min.jpg",
        title: "For Her",
        description: "2 flavored creamed honeys, Rosato, wooden honey dipper",
        priceDollar: 55,
        id: "forHer",
        priceShekel: shopRegion === "US" ? 190 : Math.ceil(55 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      // {
      //   url: "boxOfFour-min.jpg",
      //   title: "Box of Four",
      //   description:
      //     "4 flavored creamed honeys wrapped in a beautiful gift box with a wooden honey dipper",
      //   description: "4 flavored creamed honeys wrapped in a beautiful gift box with a wooden honey dipper",
      //   priceDollar: shopRegion === "US" ? 65 : 55,
      //   id: "boxOfFour",
      //   priceShekel: calculatePriceInShekels(
      //     shopRegion === "US" ? 65 : 55,
      //     exchangeRate
      //   ),
      //   woodenBoard: false,
      // },
      {
        url: "Board of Four no plastic-min.jpg",
        title: "Board of Four",
        description: "4 flavored creamed honeys on a serving board",
        warning: "*Board may vary based on availability",
        priceDollar: 70,
        id: "boardOfFour",
        priceShekel: shopRegion === "US" ? 242 : Math.ceil(70 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: false,
      },
      {
        url: "chocolateDelight-min.png",
        title: "Chocolate Delight",
        description:
          "2 Flavored creamed honeys, 4 Dairy belgian chocolates, wooden honey dipper.",
        priceDollar: 65,
        id: "chocolateDelight",
        priceShekel: shopRegion === "US" ? 224 : Math.ceil(65 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "tnbCollectionBox.jpg",
        title: "T&Bee Collection",
        description:
          "6 flavored creamed honeys wrapped in a beautiful gift box with a wooden honey dipper.",
        priceDollar: 95,
        id: "tnBeeCollection",
        priceShekel: shopRegion === "US" ? 294 : Math.ceil(95 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "honeyALaConnoisseur.jpg",
        title: "Honey A' La Connoisseur",
        description:
          "2 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
        warning: "*Wine bottle may vary based on availability",
        priceDollar: 90,
        id: "HoneyALaConnoisseur",
        priceShekel: shopRegion === "US" ? 310 : Math.ceil(90 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "Collection Plus $95-min.jpg",
        title: "Collection Plus",
        description:
          "6 Flavored creamed honeys, 5 Dairy Belgian chocolates, wooden honey dipper.",
        warning: "*Wine bottle, board may vary based on availability",
        priceDollar: 125,
        id: "collectionPlusBox",
        priceShekel: shopRegion === "US" ? 432 : Math.ceil(125 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "Honeycomb collection board no plastic-min.jpg",
        title: "Honeycomb Collection Board",
        description:
          "7 delicious flavored creamed honeys on a serving board.",
        warning: "*Board may vary based on availability",
        priceDollar: shopRegion === "US" ? 125 : 120,
        id: "honeycombCollectionBoard",
        priceShekel: shopRegion === "US" ? 432 : Math.ceil(120 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: false,
      },
      {
        url: "Belgian Box $100-min.jpg",
        title: "Premium Plus",
        description:
          "4 Flavored creamed honeys, 12 Dairy Belgian chocolates, wooden honey dipper.",
        priceDollar: 115,
        id: "belgianBox",
        priceShekel: shopRegion === "US" ? 397 : Math.ceil(115 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "Deluxe Box $120-min.jpg",
        title: "Golden Sweets",
        description:
          "5 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
        warning: "*Wine bottle may vary based on availability",
        priceDollar: 140,
        id: "deluxeBox",
        priceShekel: shopRegion === "US" ? 485 : Math.ceil(140 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      // {
      //   url: "Deluxe Board no plastic-min.jpg",
      //   title: "Deluxe Board",
      //   description: `5 Flavored creamed honeys, ${
      //       shopRegion === "US" ? "750ml" : "375ml"
      //     } bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.`,
      //   warning: "*Wine bottle will vary based on availability",
      //   priceDollar: shopRegion === "US" ? 150 : 136,
      //   id: "deluxeBoard",
      //   priceShekel: calculatePriceInShekels(
      //     shopRegion === "US" ? 150 : 136,
      //     exchangeRate
      //   ),
      //   woodenBoard: false,
      // },
      {
        url: "scoth n sweets-min.png",
        title: "Scotch n' Sweets Board",
        description:
          "4 Flavored creamed honeys, 5 Dairy Belgian chocolates, 700ml Bottle of Glenlivet, wooden honey dipper, honey board.",
        warning: "*Board may vary based on availability",
        priceDollar: shopRegion === "US" ? 175 : 180,
        id: "scotchNSweetsBoard",
        priceShekel: shopRegion === "US" ? 622 : Math.ceil(180 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: false,
      },
      {
        url: "theBossBoard.jpg",
        title: "The Boss Board",
        description:
          "6 Flavored creamed honeys, Bottle of wine, 9 Dairy Belgian chocolates, Wooden honey dipper, serving board.",
        warning: "*Wine bottle, board may vary based on availability",
        priceDollar: 195,
        id: "theBossBoard",
        priceShekel: shopRegion === "US" ? 675 : Math.ceil(195 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: false,
      },
      {
        url: "BeeCaring.jpg",
        title: "Bee Caring",
        description:
          "4 Flavored creamed honeys, 7 Dairy Belgian chocolates in heart shaped box, Wooden honey dipper, serving board.",
        warning:
          "*Board may vary based on availability. Hashgacha of chocolate: Badatz Eida Hachareidis Yerushalyim",
        priceDollar: 110,
        id: "beeCaring",
        priceShekel: shopRegion === "US" ? 380 : Math.ceil(110 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "BeeKind.jpg",
        title: "Bee Kind",
        description:
          "4 Flavored creamed honeys, bottle of Tura wine, 5 Dairy Belgian chocolates, Wooden honey dipper, serving board.",
        warning:
          "*Wine board may vary based on availability. Hashgacha of chocolate: Badatz Eida Hachareidis Yerushalyim. Hashgacha of wine: OU of America",
        priceDollar: 130,
        id: "beeKind",
        priceShekel: shopRegion === "US" ? 450 : Math.ceil(130 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
      {
        url: "DeluxeBoard.jpg",
        title: "Deluxe Board",
        description:
          "5 Flavored creamed honeys, Bottle of Isaac Ram wine, 5 Dairy Belgian chocolates, Wooden honey dipper, serving board.",
        warning:
          "*Wine board may vary based on availability. Hashgacha of chocolate: Badatz Eida Hachareidis Yerushalyim. Hashgacha of wine: OU of America",
        priceDollar: 180,
        id: "deluxeBoard",
        priceShekel: shopRegion === "US" ? 620 : Math.ceil(180 * CHOSEN_EXCHANGE_RATE),
        woodenBoard: true,
      },
    ];

    // Filter items based on the US region
    return (
      shopRegion === "US"
        ? allItems.filter((item) =>
            [
              "honeycombCollectionBoard",
              "boardOfFour",
              "scotchNSweetsBoard",
              "beeCaring",
              "beeKind",
              "deluxeBoard",
            ].includes(item.id)
          )
        : allItems.filter((item) =>
            [
              "forHim",
              "forHer",
              "boardOfFour",
              "chocolateDelight",
              "tnBeeCollection",
              "HoneyALaConnoisseur",
              "collectionPlusBox",
              "honeycombCollectionBoard",
              "belgianBox",
              "deluxeBox",
              "scotchNSweetsBoard",
              "theBossBoard",
            ].includes(item.id)
          )
    )
      .slice()
      .sort((a, b) => a.priceDollar - b.priceDollar);
  }, [exchangeRate, shopRegion]);

  /* NEW: modal helpers (mirrors HoneyCollection) */
  const openModal = (item) => {
    setSelectedItem(item);
    const count = honeyCountById[item.id] || 0;
    setSelectedFlavors(Array(count).fill("Chocolate Creamed Honey"));
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleQuantityChange = (item, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [item.id]: quantity,
    }));
  };

  const handleAddToCart = (item, inModal = false) => {
    const quantity = quantities[item.id] || 1;
    const count = honeyCountById[item.id] || 0;

    const isHoneycomb = item.id === "honeycombCollectionBoard";
    const payload = {
      ...item,
      quantity,
      selectedFlavors: isHoneycomb ? honeyFlavors : selectedFlavors,
    };

    addToCart(payload);
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    triggerNotification(item, inModal);
  };

  const triggerNotification = (item, inModal) => {
    if (inModal) {
      setAddedToCart((prev) => ({ ...prev, modal: true }));
      setTimeout(
        () => setAddedToCart((prev) => ({ ...prev, modal: "hide" })),
        1500
      );
      setTimeout(() => {
        setAddedToCart((prev) => ({ ...prev, modal: false }));
        closeModal();
      }, 2000);
    } else {
      setAddedToCart((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(
        () => setAddedToCart((prev) => ({ ...prev, [item.id]: "hide" })),
        1500
      );
      setTimeout(
        () => setAddedToCart((prev) => ({ ...prev, [item.id]: false })),
        2000
      );
    }
  };

  return (
    <div className="gift-packages">
      <p className="availability-note">
        **Items may vary based on availability**
      </p>
      <p className="availability-note">
        {shopRegion === "Israel"
          ? "**If you choose a flavor that is out of stock, it will be replaced with a different flavor**"
          : "**If a flavor is out of stock, it will be replaced with a different flavor**"}
      </p>
      <h2 className="gift-packages-section-title">Gift Packages</h2>
      <div className="gift-packages-images">
        {items.map((item) => (
          <GiftPackageItem
            key={item.id}
            item={item}
            currency={currency}
            openModal={openModal}
          />
        ))}
      </div>

      {/* NEW: Modal (close or add to cart), mirroring HoneyCollection structure */}
      {modalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="honey-close-btn" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content">
              <img src={selectedItem.url} alt={selectedItem.title} />
              <h3>{selectedItem.title}</h3>

              <div className="honey-price-size">
                <span className="honey-price">
                  {currency === "Dollar"
                    ? `$${selectedItem.priceDollar}`
                    : `₪${selectedItem.priceShekel}`}
                </span>
              </div>

              {selectedItem.description && (
                <p className="gift-package-description">
                  {selectedItem.description}
                </p>
              )}
              {selectedItem.warning && selectedItem.warning.trim() !== "" && (
                <p className="gift-package-warning">{selectedItem.warning}</p>
              )}

              {selectedItem.woodenBoard && (
                <p>This gift may be displayed on a board.</p>
              )}

              <div className="quantity-selector">
                <label htmlFor="modal-quantity">Quantity:</label>
                <QuantitySelector
                  id="modal-quantity"
                  value={quantities[selectedItem.id] || 1}
                  onChange={(e) =>
                    handleQuantityChange(
                      selectedItem,
                      parseInt(e.target.value, 10)
                    )
                  }
                />
              </div>

              {honeyCountById[selectedItem.id] !== 7 &&
                honeyCountById[selectedItem.id] > 0 && (
                  <FlavorSelector
                    flavors={honeyFlavors}
                    selectedFlavors={selectedFlavors}
                    handleFlavorChange={handleFlavorChange}
                  />
                )}

              {addedToCart.modal ? (
                <div
                  className={`notification ${
                    addedToCart.modal === "hide" ? "hide" : "show"
                  }`}
                >
                  <FaCheckCircle className="checkmark" />
                  Added to cart
                </div>
              ) : (
                <button
                  onClick={() => handleAddToCart(selectedItem, true)}
                  className="add-to-cart-btn"
                  title="Add this package to your cart"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GiftPackages;
