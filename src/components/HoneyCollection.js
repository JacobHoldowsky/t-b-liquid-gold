import React, { useState } from "react";
import "./HoneyCollection.css";

function HoneyCollection({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    {
      url: "bourbon small jar.jpg",
      title: "Bourbon Large Jar",
      priceDollar: "$30",
      priceShekel: "₪100",
    },
    {
      url: "chocolate small jar.jpg",
      title: "Chocolate Large Jar",
      priceDollar: "$30",
      priceShekel: "₪100",
    },
    {
      url: "cinnamon small jar.jpg",
      title: "Cinnamon Large Jar",
      priceDollar: "$30",
      priceShekel: "₪100",
    },
    {
      url: "cinnamon small jar.jpg",
      title: "Blueberry Large Jar",
      priceDollar: "$30",
      priceShekel: "₪100",
    },
    {
      url: "pumpkin small jar.JPG",
      title: "Pumpkin Large Jar",
      priceDollar: "$30",
      priceShekel: "₪100",
    },
    {
      url: "sea salt small jar.jpg",
      title: "Sea Salt Large Jar",
      priceDollar: "$30",
      priceShekel: "₪100",
    },
    {
      url: "vanilla small jar.jpg",
      title: "Vanilla Large Jar",
      priceDollar: "$30",
      priceShekel: "₪100",
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
                {item.priceDollar} / {item.priceShekel}
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
                {selectedItem.priceDollar} / {selectedItem.priceShekel}
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
