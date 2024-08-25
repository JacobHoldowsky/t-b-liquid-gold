import React, { useState, useContext } from "react";
import "./HoneyCollection.css";
import { CurrencyContext } from "../context/CurrencyContext"; // Import CurrencyContext
import { FaCheckCircle } from "react-icons/fa"; // Import a checkmark icon

function HoneyCollection({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({}); // State to track quantities
  const [addedToCart, setAddedToCart] = useState({}); // Track which items have been added
  const [modalAddedToCart, setModalAddedToCart] = useState(false); // Separate state for modal

  const { currency } = useContext(CurrencyContext); // Use context here
  const items = [
    {
      url: "chocolate small jar.jpg",
      title: "Chocolate Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "12",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "cinnamon small jar.jpg",
      title: "Cinnamon Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "12",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "pumpkin small jar.JPG",
      title: "Pumpkin Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "12",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "sea salt small jar.jpg",
      title: "Sea Salt Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "12",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "vanilla small jar.jpg",
      title: "Vanilla Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "12",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "bourbon small jar.jpg",
      title: "Bourbon Creamed Honey",
      sizeUS: "4oz",
      priceDollar: "14",
      sizeIL: "120ml",
      priceShekel: "45",
    },
    {
      url: "blueberry screenshot.png",
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

  const handleQuantityChange = (item, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [item.title]: quantity,
    }));
  };

  const handleAddToCart = (item, inModal = false) => {
    const quantity = quantities[item.title] || 1;
    addToCart({ ...item, quantity });
    setQuantities((prev) => ({ ...prev, [item.title]: 1 }));

    if (inModal) {
      setModalAddedToCart(true);
      setTimeout(() => {
        setModalAddedToCart("hide");
      }, 1500);

      setTimeout(() => {
        setModalAddedToCart(false);
        closeModal(); // Optionally close the modal after the animation
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
              <div className="honey-price-size">
                <span className="honey-price">
                  {currency === "Dollar"
                    ? `$${item.priceDollar}`
                    : `₪${item.priceShekel}`}
                </span>
                <span className="honey-size">
                  Size: {currency === "Dollar" ? item.sizeUS : item.sizeIL}
                </span>
              </div>
              <div className="quantity-selector">
                <label htmlFor={`quantity-${index}`}>Quantity:</label>
                <select
                  className="select-dropdown"
                  id={`quantity-${index}`}
                  value={quantities[item.title] || 1}
                  onChange={(e) =>
                    handleQuantityChange(item, parseInt(e.target.value, 10))
                  }
                >
                  {[...Array(10).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
              </div>
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
                <span className="honey-size">
                  Size:{" "}
                  {currency === "Dollar"
                    ? selectedItem.sizeUS
                    : selectedItem.sizeIL}
                </span>
              </div>
              <div className="quantity-selector">
                <label htmlFor="modal-quantity">Quantity:</label>
                <select
                  className="select-dropdown"
                  value={quantities[selectedItem.title] || 1}
                  onChange={(e) =>
                    handleQuantityChange(
                      selectedItem,
                      parseInt(e.target.value, 10)
                    )
                  }
                >
                  {[...Array(10).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
              </div>
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

export default HoneyCollection;
