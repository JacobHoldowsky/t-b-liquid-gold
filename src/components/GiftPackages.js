import React, { useState, useContext } from "react";
import "./GiftPackages.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";

function GiftPackages({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});
  const [modalAddedToCart, setModalAddedToCart] = useState(false);

  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);

  const items = [
    {
      url: "For Him $55.jpg",
      title: "For Him",
      priceDollar: 55,
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
    },
    {
      url: "For Her $55.jpg",
      title: "For Her",
      priceDollar: 55,
      priceShekel: exchangeRate
        ? Math.ceil(55 * exchangeRate)
        : Math.ceil(55 * 3.7),
    },
    {
      url: "chocolateDelight.png",
      title: "Chocolate Delight",
      priceDollar: 65,
      priceShekel: exchangeRate
        ? Math.ceil(65 * exchangeRate)
        : Math.ceil(65 * 3.7),
    },
    {
      url: "tnbCollection.jpg",
      title: "T&Bee Collection",
      priceDollar: 79,
      priceShekel: exchangeRate
        ? Math.ceil(79 * exchangeRate)
        : Math.ceil(79 * 3.7),
    },
    {
      url: "aLaConnoisseur.jpg",
      title: "A' LA Connoisseur",
      priceDollar: 85,
      priceShekel: exchangeRate
        ? Math.ceil(85 * exchangeRate)
        : Math.ceil(85 * 3.7),
    },
    {
      url: "Belgian Box $100.jpg",
      title: "Belgian Box",
      priceDollar: 100,
      priceShekel: exchangeRate
        ? Math.ceil(100 * exchangeRate)
        : Math.ceil(100 * 3.7),
    },
    {
      url: "Collection Plus $95.jpg",
      title: "Collection Plus",
      priceDollar: 105,
      priceShekel: exchangeRate
        ? Math.ceil(105 * exchangeRate)
        : Math.ceil(105 * 3.7),
    },
    {
      url: "Deluxe Box $120.jpg",
      title: "Deluxe Box",
      priceDollar: 120,
      priceShekel: exchangeRate
        ? Math.ceil(120 * exchangeRate)
        : Math.ceil(120 * 3.7),
    },
  ];

  const openModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.classList.remove("modal-open");
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleAddToCart = (item, inModal = false) => {
    addToCart({ ...item, quantity: 1 });

    if (inModal) {
      setModalAddedToCart(true);
      setTimeout(() => {
        setModalAddedToCart("hide");
      }, 1500);

      setTimeout(() => {
        setModalAddedToCart(false);
        closeModal();
      }, 2000);
    } else {
      setAddedToCart((prev) => ({
        ...prev,
        [item.title]: true,
      }));

      setTimeout(() => {
        setAddedToCart((prev) => ({
          ...prev,
          [item.title]: "hide",
        }));
      }, 1500);

      setTimeout(() => {
        setAddedToCart((prev) => ({
          ...prev,
          [item.title]: false,
        }));
      }, 2000);
    }
  };

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
              <img
                src={item.url}
                alt={item.title}
                onClick={() => openModal(item)}
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
            {addedToCart[item.title] ? (
              <div
                className={`notification ${
                  addedToCart[item.title] === "hide" ? "hide" : "show"
                }`}
              >
                <FaCheckCircle className="checkmark" />
                Added to cart
              </div>
            ) : (
              <button
                onClick={() => handleAddToCart(item)}
                className="add-to-cart-btn"
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
      {modalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={handleModalClick}>
            <button className="gift-packages-close-btn" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content">
              <img src={selectedItem.url} alt={selectedItem.title} />
              <h3>{selectedItem.title}</h3>
              <p>
                {currency === "Dollar"
                  ? `$${selectedItem.priceDollar}`
                  : `₪${selectedItem.priceShekel}`}
              </p>
              {modalAddedToCart ? (
                <div
                  className={`notification ${
                    modalAddedToCart === "hide" ? "hide" : "show"
                  }`}
                >
                  <FaCheckCircle className="checkmark" />
                  Added to cart
                </div>
              ) : (
                <button
                  onClick={() => handleAddToCart(selectedItem, true)}
                  className="add-to-cart-btn"
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
