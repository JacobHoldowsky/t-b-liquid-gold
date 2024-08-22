import React, { useState, useContext } from "react";
import "./CorporateGifts.css";
import { CurrencyContext } from "../context/CurrencyContext"; // Import CurrencyContext

function CorporateGifts({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { currency } = useContext(CurrencyContext); // Use context here

  const items = [
    {
      url: "Collection Plus $95.jpg",
      title: "Collection Plus",
      priceDollar: "105",
      priceShekel: "320",
    },
    {
      url: "Deluxe Box $120.jpg",
      title: "Deluxe Box",
      priceDollar: "120",
      priceShekel: "400",
    },
    {
      url: "Belgian Box $100.jpg",
      title: "Belgian Box",
      priceDollar: "100",
      priceShekel: "350",
    },
    {
      url: "For Him $55.jpg",
      title: "For Him",
      priceDollar: "55",
      priceShekel: "200",
    },
    {
      url: "For Her $55.jpg",
      title: "For Her",
      priceDollar: "55",
      priceShekel: "200",
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
    <div className="corporate-gifts">
      <h2 className="corporate-gifts-section-title">Corporate Gifts</h2>
      <div className="corporate-gifts-images">
        {items.map((item, index) => (
          <div key={index} className="corporate-gifts-div">
            <div className="corporate-gifts-image">
              <img
                src={item.url}
                alt={item.title}
                onClick={() => openModal(item)}
              />
            </div>
            <div className="corporate-gifts-info">
              <h3>{item.title}</h3>
              <p>
                {/* Display the price based on the selected currency */}
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
            <button className="corporate-gifts-close-btn" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content">
              <img src={selectedItem.url} alt={selectedItem.title} />
              <h3>{selectedItem.title}</h3>
              <p>
                {/* Display the price based on the selected currency in the modal */}
                {currency === "Dollar"
                  ? `$${selectedItem.priceDollar}`
                  : `₪${selectedItem.priceShekel}`}
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

export default CorporateGifts;
