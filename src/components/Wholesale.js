import React, { useState } from "react";
import "./Wholesale.css";

function Wholesale({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    {
      url: "bourbon small jar.jpg",
      title: "Bourbon Small Jar",
      priceDollar: "$15",
      priceShekel: "₪50",
    },
    {
      url: "chocolate small jar.jpg",
      title: "Chocolate Small Jar",
      priceDollar: "$15",
      priceShekel: "₪50",
    },
    {
      url: "cinnamon small jar.jpg",
      title: "Cinnamon Small Jar",
      priceDollar: "$15",
      priceShekel: "₪50",
    },
    {
      url: "pumpkin small jar.JPG",
      title: "Pumpkin Small Jar",
      priceDollar: "$15",
      priceShekel: "₪50",
    },
    {
      url: "sea salt small jar.jpg",
      title: "Sea Salt Small Jar",
      priceDollar: "$15",
      priceShekel: "₪50",
    },
    {
      url: "vanilla small jar.jpg",
      title: "Vanilla Small Jar",
      priceDollar: "$15",
      priceShekel: "50",
    },
    {
      url: "blueberry small jar.jpg",
      title: "Blueberry Small Jar",
      priceDollar: "$15",
      priceShekel: "₪50",
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
          We are now selling wholesale and will be happy to service you! Minimum
          wholesale order for the 4oz jars start at 50+ jars and minimum
          wholesale order for our 2oz jars start at 100+ jars.
          <br />
          If you would like to buy wholesale please reach out to us via{" "}
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
      <div className="wholesale-images">
        {items.map((item, index) => (
          <div key={index} className="wholesale-div">
            <div className="wholesale-image">
              <img
                src={item.url}
                alt={item.title}
                onClick={() => openModal(item)}
              />
            </div>
            <div className="wholesale-info">
              <h3>{item.title}</h3>
              <p>
                {item.priceDollar} / {item.priceShekel}
              </p>
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
              <p>
                {selectedItem.priceDollar} / {selectedItem.priceShekel}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wholesale;
