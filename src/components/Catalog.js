import React, { useState } from "react";
import "./Catalog.css"; // Import CSS file for styling
import { Link } from "react-router-dom";

function Catalog({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const sections = {
    honeyJars: [
      { url: "Deluxe Box $120.jpg", title: "Deluxe Box", price: "$120" },
      { url: "Belgian Box $100.jpg", title: "Belgian Box", price: "$100" },
    ],
    giftPackages: [
      {
        url: "Collection Plus $95.jpg",
        title: "Collection Plus",
        price: "$95",
      },
      { url: "catalog4.JPG", title: "Gift Set 3", price: "$70" },
    ],
    corporateGifts: [
      { url: "catalog5.JPG", title: "Gift Set 4", price: "$80" },
      { url: "catalog6.JPG", title: "Gift Set 5", price: "$90" },
    ],
    wholesale: [
      { url: "catalog7.JPG", title: "Gift Set 6", price: "$100" },
      { url: "catalog8.JPG", title: "Gift Set 7", price: "$110" },
      { url: "catalog9.JPG", title: "Gift Set 8", price: "$120" },
    ],
  };

  const capitalizeWords = (str) =>
    str
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const openModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="catalog">
      {Object.keys(sections).map((section) => (
        <div key={section} id={section} className="catalog-section">
          <h2 className="catalog-section-title">{capitalizeWords(section)}</h2>
          <div className="catalog-images">
            {sections[section].map((item, index) => (
              <div key={index} className="catalog-div">
                <div className="catalog-image">
                  <img
                    src={item.url}
                    alt={item.title}
                    onClick={() => openModal(item)}
                  />
                </div>
                <div className="catalog-info">
                  <h3>{item.title}</h3>
                  <p>{item.price}</p>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="add-to-cart-btn"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {modalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={handleModalClick}>
            <button className="catalog-close-btn" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content">
              <img src={selectedItem.url} alt={selectedItem.title} />
              <h3>{selectedItem.title}</h3>
              <p>{selectedItem.price}</p>
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
      {cart.length > 0 && (
        <div className="cart-actions">
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout ({cart.length})
          </Link>
        </div>
      )}
    </div>
  );
}

export default Catalog;
