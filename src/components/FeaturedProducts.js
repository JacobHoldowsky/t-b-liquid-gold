import React, { useState, useEffect } from "react";
import "./FeaturedProducts.css"; // Import CSS for styling

function FeaturedProducts() {
  // Dummy data for featured products (replace with actual data)
  const featuredProducts = [
    {
      id: 1,
      name: "Product 1",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$19.99",
      image: "present1.jpg",
    },
    {
      id: 2,
      name: "Product 2",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$24.99",
      image: "present2.jpg", // Replace with image path
    },
    {
      id: 2,
      name: "Product 5",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$24.99",
      image: "present4.jpg", // Replace with image path
    },
    {
      id: 1,
      name: "Product 7",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$19.99",
      image: "present6.jpg",
    },
    {
      id: 2,
      name: "Product 8",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$24.99",
      image: "present7.jpg", // Replace with image path
    },
    {
      id: 3,
      name: "Product 9",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$29.99",
      image: "present8.jpg", // Replace with image path
    },
    {
      id: 1,
      name: "Product 10",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$19.99",
      image: "present9.jpg",
    },
    {
      id: 2,
      name: "Product 2",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$24.99",
      image: "present10.jpg", // Replace with image path
    },
    {
      id: 3,
      name: "Product 3",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$29.99",
      image: "present11.jpg", // Replace with image path
    },
    {
      id: 1,
      name: "Product 1",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$19.99",
      image: "present12.jpg",
    },
    {
      id: 2,
      name: "Product 2",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$24.99",
      image: "present13.jpg", // Replace with image path
    },
    {
      id: 3,
      name: "Product 3",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$29.99",
      image: "present14.jpg", // Replace with image path
    },
    {
      id: 1,
      name: "Product 1",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$19.99",
      image: "present15.jpg",
    },
    {
      id: 3,
      name: "Product 3",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "$29.99",
      image: "present3.jpg", // Replace with image path
    },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

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
    <div>
      <section className="featured-products">
        <h2>Custom Made Gift Packages</h2>
        <div className="product-list">
          {featuredProducts.map((product) => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => openModal(product.image)}
            >
              <img src={product.image} alt={product.name} loading="lazy" />
            </div>
          ))}
        </div>
      </section>
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={handleModalClick}>
            <button
              className="featured-products-close-btn"
              onClick={closeModal}
            >
              &times;
            </button>
            <img src={selectedImage} alt="Enlarged" loading="lazy" />
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturedProducts;
