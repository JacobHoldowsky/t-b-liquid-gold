import React, { useState, useContext } from "react";
import "./HoneyCollection.css";
import { CurrencyContext } from "../context/CurrencyContext"; // Import CurrencyContext

function HoneyCollection({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { currency } = useContext(CurrencyContext); // Use context here

  const items = [
    {
      url: "bourbon small jar.jpg",
      title: "Bourbon Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "chocolate small jar.jpg",
      title: "Chocolate Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "cinnamon small jar.jpg",
      title: "Cinnamon Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "pumpkin small jar.JPG",
      title: "Pumpkin Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "sea salt small jar.jpg",
      title: "Sea Salt Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "vanilla small jar.jpg",
      title: "Vanilla Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "blueberry small jar.jpg",
      title: "Blueberry Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
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
    <div className="honey">
      <h2 className="honey-section-title">Honey Collection</h2>
      <div className="honey-images">
        {items.map((item, index) => (
          <div key={index} className="honey-div">
            <div className="honey-image">
              <img
                src={item.url}
                alt={item.title}
                onClick={() => openModal(item)}
              />
            </div>
            <div className="honey-info">
              <h3>{item.title}</h3>
              <p>
                {currency === "Dollar"
                  ? `$${item.priceDollar}`
                  : `₪${item.priceShekel}`}
                {" / "}
                {currency === "Dollar" ? item.sizeUS : item.sizeIL}
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
            <button className="honey-close-btn" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content">
              <img src={selectedItem.url} alt={selectedItem.title} />
              <h3>{selectedItem.title}</h3>
              <p>
                {currency === "Dollar"
                  ? `$${selectedItem.priceDollar}`
                  : `₪${selectedItem.priceShekel}`}
                {" / "}
                {currency === "Dollar"
                  ? selectedItem.sizeUS
                  : selectedItem.sizeIL}
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

export default HoneyCollection;
