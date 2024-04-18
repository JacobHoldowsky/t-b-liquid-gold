import React, { useState, useEffect } from "react";
import "./Catalog.css"; // Import CSS file for styling

function Catalog() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const presentImages = [
    "catalog1.JPG",
    "catalog2.JPG",
    "catalog3.JPG",
    "catalog4.JPG",
    "catalog5.JPG",
    "catalog6.JPG",
    "catalog7.JPG",
    "catalog8.JPG",
    "catalog9.JPG",
    "catalog10.JPG",
    "catalog11.JPG",
  ];

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    // Add or remove 'modal-open' class from body based on modalOpen state
    if (modalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalOpen]);

  const handleModalClick = (e) => {
    // Stop event propagation when clicking inside the modal content
    e.stopPropagation();
  };

  return (
    <div className="catalog">
      <div className="present-images">
        {presentImages.map((imageUrl, index) => (
          <img
            key={index}
            src={imageUrl}
            alt={`Present ${index + 1}`}
            loading="lazy"
            onClick={() => openModal(imageUrl)}
          />
        ))}
      </div>
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={handleModalClick}>
            <button className="catalog-close-btn" onClick={closeModal}>
              &times;
            </button>
            <img src={selectedImage} alt="Enlarged" loading="lazy" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalog;
