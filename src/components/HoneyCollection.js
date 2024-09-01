import React, { useState, useContext, useMemo } from "react";
import "./HoneyCollection.css";
import { CurrencyContext } from "../context/CurrencyContext"; // Import CurrencyContext
import { FaCheckCircle } from "react-icons/fa"; // Import a checkmark icon

// Reusable Quantity Selector Component
const QuantitySelector = ({ id, value, onChange }) => (
  <select className="select-dropdown" id={id} value={value} onChange={onChange}>
    {[...Array(10).keys()].map((num) => (
      <option key={num + 1} value={num + 1}>
        {num + 1}
      </option>
    ))}
  </select>
);

// Reusable Honey Item Component
const HoneyItem = ({
  item,
  currency,
  quantities,
  handleQuantityChange,
  handleAddToCart,
  addedToCart,
  openModal,
}) => {
  const price = currency === "Dollar" ? item.priceDollar : item.priceShekel;
  const size = currency === "Dollar" ? item.sizeUS : item.sizeIL;
  const notificationClass = addedToCart[item.title];

  return (
    <div className="honey-div">
      <div className="honey-image">
        <img src={item.url} alt={item.title} onClick={() => openModal(item)} />
      </div>
      <div className="honey-info">
        <h3>{item.title}</h3>
        <div className="honey-price-size">
          <span className="honey-price">
            {currency === "Dollar" ? `$${price}` : `₪${price}`}
          </span>
          <span className="honey-size">Size: {size}</span>
        </div>
        <div className="quantity-selector">
          <label htmlFor={`quantity-${item.title}`}>Quantity:</label>
          <QuantitySelector
            id={`quantity-${item.title}`}
            value={quantities[item.title] || 1}
            onChange={(e) =>
              handleQuantityChange(item, parseInt(e.target.value, 10))
            }
          />
        </div>
      </div>
      {notificationClass ? (
        <div
          className={`notification ${
            notificationClass === "hide" ? "hide" : "show"
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
  );
};

function HoneyCollection({ cart, addToCart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({}); // State to track quantities
  const [addedToCart, setAddedToCart] = useState({}); // Track which items have been added

  const { currency } = useContext(CurrencyContext); // Use context here

  // Memoize the items list to prevent re-creating on each render
  const items = useMemo(
    () => [
      {
        url: "chocolate small jar-min.jpg",
        title: "Chocolate Creamed Honey",
        sizeUS: "4oz",
        priceDollar: "12",
        sizeIL: "120ml",
        priceShekel: "45",
      },
      {
        url: "cinnamon small jar-min.jpg",
        title: "Cinnamon Creamed Honey",
        sizeUS: "4oz",
        priceDollar: "12",
        sizeIL: "120ml",
        priceShekel: "45",
      },
      {
        url: "pumpkin small jar-min.JPG",
        title: "Pumpkin Creamed Honey",
        sizeUS: "4oz",
        priceDollar: "12",
        sizeIL: "120ml",
        priceShekel: "45",
      },
      {
        url: "sea salt small jar-min.jpg",
        title: "Sea Salt Creamed Honey",
        sizeUS: "4oz",
        priceDollar: "12",
        sizeIL: "120ml",
        priceShekel: "45",
      },
      {
        url: "vanilla small jar-min.jpg",
        title: "Vanilla Creamed Honey",
        sizeUS: "4oz",
        priceDollar: "12",
        sizeIL: "120ml",
        priceShekel: "45",
      },
      {
        url: "bourbon small jar-min.jpg",
        title: "Bourbon Creamed Honey",
        sizeUS: "4oz",
        priceDollar: "14",
        sizeIL: "120ml",
        priceShekel: "55",
      },
      {
        url: "blueberry screenshot-min.png",
        title: "Blueberry Creamed Honey",
        sizeUS: "4oz",
        priceDollar: "14",
        sizeIL: "120ml",
        priceShekel: "55",
      },
    ],
    []
  );

  const openModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

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

    triggerNotification(item, inModal);
  };

  const triggerNotification = (item, inModal) => {
    if (inModal) {
      setAddedToCart((prev) => ({ ...prev, modal: true }));
      setTimeout(
        () => setAddedToCart((prev) => ({ ...prev, modal: "hide" })),
        1500
      );
      setTimeout(() => {
        setAddedToCart((prev) => ({ ...prev, modal: false }));
        closeModal(); // Close modal after notification is hidden
      }, 2000);
    } else {
      setAddedToCart((prev) => ({
        ...prev,
        [item.title]: true,
      }));
      setTimeout(() => {
        setAddedToCart((prev) => ({ ...prev, [item.title]: "hide" }));
      }, 1500);
      setTimeout(() => {
        setAddedToCart((prev) => ({ ...prev, [item.title]: false }));
      }, 2000);
    }
  };

  return (
    <div className="honey">
      <h2 className="honey-section-title">Honey Collection</h2>
      <div className="honey-images">
        {items.map((item) => (
          <HoneyItem
            key={item.title}
            item={item}
            currency={currency}
            quantities={quantities}
            handleQuantityChange={handleQuantityChange}
            handleAddToCart={handleAddToCart}
            addedToCart={addedToCart}
            openModal={openModal}
          />
        ))}
      </div>
      {modalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                <QuantitySelector
                  id="modal-quantity"
                  value={quantities[selectedItem.title] || 1}
                  onChange={(e) =>
                    handleQuantityChange(
                      selectedItem,
                      parseInt(e.target.value, 10)
                    )
                  }
                />
              </div>
              {addedToCart.modal ? (
                <div
                  className={`notification ${
                    addedToCart.modal === "hide" ? "hide" : "show"
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
