import React, { useState } from "react";
import "./Wholesale.css";

function Wholesale({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    {
      url: "mini jar pyramid.jpg",
      title: "T&Bee 2oz Jars",
      size: "small",
    },
    {
      url: "Honey Collection.png",
      title: "T&Bee 4oz Jars",
      size: "large",
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
    <div className="wholesale">
      <h2 className="wholesale-section-title">Wholesale</h2>
      <div className="wholesale-message">
        <p>
          We are now offering wholesale orders! Minimum orders for 4oz jars
          start at 50+ jars, and 2oz jars at 100+ jars.
          <br />
          For inquiries, please contact us via{" "}
          <a
            href="https://wa.me/+972534309254"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          .
        </p>
      </div>

      {/* Combined Jar Sections */}
      <div className="wholesale-jar-section">
        {items.map((item, index) => (
          <div
            key={index}
            className="wholesale-div"
            onClick={() => openModal(item)}
          >
            <div className="wholesale-image">
              <img src={item.url} alt={item.title} />
            </div>
            <div className="wholesale-info">
              <h3>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={handleModalClick}>
            <button className="wholesale-close-btn" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content">
              <img src={selectedItem.url} alt={selectedItem.title} />
              <h3>{selectedItem.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wholesale;
