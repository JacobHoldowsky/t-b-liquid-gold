import React, { useState, useContext } from "react";
import "./GiftPackages.css";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext"; // Import the context

function GiftPackages({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext); // Use the context here

  const items = [
    {
      url: "Collection Plus $95.jpg",
      title: "Collection Plus",
      priceDollar: 105,
      priceShekel: exchangeRate ? Math.ceil(105 * exchangeRate) : 0,
    },
    {
      url: "Deluxe Box $120.jpg",
      title: "Deluxe Box",
      priceDollar: 120,
      priceShekel: exchangeRate ? Math.ceil(120 * exchangeRate) : 0,
    },
    {
      url: "Belgian Box $100.jpg",
      title: "Belgian Box",
      priceDollar: 100,
      priceShekel: exchangeRate ? Math.ceil(100 * exchangeRate) : 0,
    },
    {
      url: "Chocolate delight, $55.png",
      title: "Chocolate Delight",
      priceDollar: 65,
      priceShekel: exchangeRate ? Math.ceil(65 * exchangeRate) : 0,
    },
    {
      url: "220717-112502_jpg best.jpg",
      title: "Honey A' LA Connoisseur",
      priceDollar: 85,
      priceShekel: exchangeRate ? Math.ceil(85 * exchangeRate) : 0,
    },
    {
      url: "220717-111308_jpg best.jpg",
      title: "T&Bee Collection",
      priceDollar: 79,
      priceShekel: exchangeRate ? Math.ceil(79 * exchangeRate) : 0,
    },
    {
      url: "For Him $55.jpg",
      title: "For Him",
      priceDollar: 55,
      priceShekel: exchangeRate ? Math.ceil(55 * exchangeRate) : 0,
    },
    {
      url: "For Her $55.jpg",
      title: "For Her",
      priceDollar: 55,
      priceShekel: exchangeRate ? Math.ceil(55 * exchangeRate) : 0,
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

  return (
    <div className="gift-packages">
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
            <button onClick={() => addToCart(item)} className="add-to-cart-btn">
              Add to Cart
            </button>
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
                  : `₪${selectedItem.priceDollar}`}
              </p>
              <button
                onClick={() => {
                  addToCart(selectedItem);
                  closeModal();
                }}
                className="add-to-cart-btn"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GiftPackages;
