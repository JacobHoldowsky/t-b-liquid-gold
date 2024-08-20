import React, { useState } from "react";
import "./Catalog.css"; // Import CSS file for styling
import { Link } from "react-router-dom";

function Catalog({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const sections = {
    ourCollection: [
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
        url: "cinnamon small jar.jpg",
        title: "Blueberry Small Jar",
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
    ],
    giftPackages: [
      {
        url: "Collection Plus $95.jpg",
        title: "Collection Plus",
        priceDollar: "$95",
        priceShekel: "₪320",
      },
      {
        url: "Deluxe Box $120.jpg",
        title: "Deluxe Box",
        priceDollar: "$120",
        priceShekel: "₪400",
      },
      {
        url: "Belgian Box $100.jpg",
        title: "Belgian Box",
        priceDollar: "$100",
        priceShekel: "₪350",
      },
      {
        url: "For Him $55.jpg",
        title: "For Him",
        priceDollar: "$55",
        priceShekel: "₪200",
      },
      {
        url: "For Her $55.jpg",
        title: "For Her",
        priceDollar: "$55",
        priceShekel: "₪200",
      },
    ],
    corporateGifts: [
      {
        url: "Collection Plus $95.jpg",
        title: "Collection Plus",
        priceDollar: "$95",
        priceShekel: "₪320",
      },
      {
        url: "Deluxe Box $120.jpg",
        title: "Deluxe Box",
        priceDollar: "$120",
        priceShekel: "₪400",
      },
      {
        url: "Belgian Box $100.jpg",
        title: "Belgian Box",
        priceDollar: "$100",
        priceShekel: "₪350",
      },
      {
        url: "For Him $55.jpg",
        title: "For Him",
        priceDollar: "$55",
        priceShekel: "₪200",
      },
      {
        url: "For Her $55.jpg",
        title: "For Her",
        priceDollar: "$55",
        priceShekel: "₪200",
      },
    ],
    wholesale: [
      {
        url: "bourbon small jar.jpg",
        title: "100 Bourbon Small Jars",
        priceDollar: "$1000",
        priceShekel: "₪3000",
      },
      {
        url: "chocolate small jar.jpg",
        title: "100 Chocolate Small Jars",
        priceDollar: "$1000",
        priceShekel: "₪3000",
      },
      {
        url: "cinnamon small jar.jpg",
        title: "100 Cinnamon Small Jars",
        priceDollar: "$1000",
        priceShekel: "₪3000",
      },
      {
        url: "cinnamon small jar.jpg",
        title: "100 Blueberry Small Jars",
        priceDollar: "$1000",
        priceShekel: "₪3000",
      },
      {
        url: "pumpkin small jar.JPG",
        title: "100 Pumpkin Small Jars",
        priceDollar: "$1000",
        priceShekel: "₪3000",
      },
      {
        url: "sea salt small jar.jpg",
        title: "100 Sea Salt Small Jars",
        priceDollar: "$1000",
        priceShekel: "₪3000",
      },
      {
        url: "vanilla small jar.jpg",
        title: "100 Vanilla Small Jars",
        priceDollar: "$1000",
        priceShekel: "₪3000",
      },
      {
        url: "bourbon small jar.jpg",
        title: "100 Bourbon Large Jars",
        priceDollar: "$2000",
        priceShekel: "₪6000",
      },
      {
        url: "chocolate small jar.jpg",
        title: "100 Chocolate Large Jars",
        priceDollar: "$2000",
        priceShekel: "₪6000",
      },
      {
        url: "cinnamon small jar.jpg",
        title: "100 Cinnamon Large Jars",
        priceDollar: "$2000",
        priceShekel: "₪6000",
      },
      {
        url: "cinnamon small jar.jpg",
        title: "100 Blueberry Large Jars",
        priceDollar: "$2000",
        priceShekel: "₪6000",
      },
      {
        url: "pumpkin small jar.JPG",
        title: "100 Pumpkin Large Jars",
        priceDollar: "$2000",
        priceShekel: "₪6000",
      },
      {
        url: "sea salt small jar.jpg",
        title: "100 Sea Salt Large Jars",
        priceDollar: "$2000",
        priceShekel: "₪6000",
      },
      {
        url: "vanilla small jar.jpg",
        title: "100 Vanilla Large Jars",
        priceDollar: "$2000",
        priceShekel: "₪6000",
      },
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
        <div
          key={section}
          id={section}
          className={`catalog-section ${section}-background`}
        >
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
                  <p>
                    {item.priceDollar} / {item.priceShekel}
                  </p>
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
