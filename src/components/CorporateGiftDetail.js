import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";
import "./CorporateGiftDetail.css";
import useFlavorSelector from "../hooks/useFlavorSelector"; // Import your custom hook
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

function CorporateGiftDetail({ cart, addToCart }) {
  const { corporateId } = useParams();
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  const items = {
    miniFourCollectionBoard: {
      title: "Mini Four Collection Board",
      description:
        "4 flavored creamed honeys, wooden honey dipper, serving board.",
      size: "Jar size 2oz",
      priceDollar: 40,
      priceShekel: 138,
      imageUrl: "/Mini four collection board with plastic-min.png",
      warning: "*Minimum orders on this gift is 5 boards",
      hasLogoOption: true,
      availableFlavors: [
        "Chocolate Creamed Honey",
        "Vanilla Creamed Honey",
        "Cinnamon Creamed Honey",
        "Sea Salt Creamed Honey",
        "Bourbon Creamed Honey",
        "Pumpkin Creamed Honey",
        "Strawberry Creamed Honey",
      ],
    },
    miniSixCollectionBoard: {
      title: "Mini Six Collection Board",
      description:
        "6 flavored creamed honeys, wooden honey dipper, serving board",
      size: "Jar size 2oz",
      priceDollar: 55,
      priceShekel: 190,
      imageUrl: "/Mini six collection board with plastic-min.png",
      warning: "*Minimum orders on this gift is 5 boards",
      hasLogoOption: true,
      isSoldOut: false,
    },
  };

  const selectedItem = items[corporateId];
  const [quantity, setQuantity] = useState(5);
  const [addedToCart, setAddedToCart] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [artwork, setArtwork] = useState(null);
  const [uploading, setUploading] = useState(false); // State to track if file is uploading
  const [uploadError, setUploadError] = useState(null); // State to handle upload errors
  const { selectedFlavors, handleFlavorChange, validateFlavorSelection } =
    useFlavorSelector(
      Array(4).fill("Chocolate Creamed Honey"), // Initial flavors
      selectedItem.availableFlavors, // Available flavors
      4 // Required number of flavors for validation
    );

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setQuantity("");
    } else {
      setQuantity(value);
    }
  };

  const handleLogoChange = (e) => {
    setIncludeLogo(e.target.checked);
  };

  const handleArtworkUpload = async (e) => {
    const file = e.target.files[0];

    // Check if a file was selected
    if (!file) {
      return;
    }

    // Check file size, limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("File size must be less than 4MB.");
      setArtwork(null);
      return;
    }

    // **New: Check filename length, limit to 100 characters**
    if (file.name.length > 100) {
      setUploadError("File name must be less than 100 characters.");
      setArtwork(null);
      return;
    }

    setUploadError(null); // Clear any previous errors
    setUploading(true); // Set uploading state to true

    const formData = new FormData();
    formData.append("file", file);

    const apiUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000/upload-logo"
        : "/api/upload-logo";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setArtwork({
          name: file.name,
          type: file.type,
          file: file,
          previewURL: data.url, // URL from S3
        });
      } else {
        setUploadError("Upload failed: " + data.message);
      }
    } catch (err) {
      setUploadError("Error uploading file: " + err.message);
    } finally {
      setUploading(false); // Set uploading state to false after the upload completes
    }
  };
  const handleAddToCart = () => {
    if (
      selectedItem.title === "Mini Four Collection Board" &&
      !validateFlavorSelection()
    ) {
      alert("Please select exactly 4 flavors.");
      return;
    }

    const itemToAdd = {
      ...selectedItem,
      priceDollar: selectedItem.priceDollar,
      priceShekel: selectedItem.priceShekel,
      quantity,
      includeLogo,
      artwork,
      logoCharge: includeLogo ? 50 : 0,
      logoUrl: includeLogo && artwork ? artwork.previewURL : null,
      selectedFlavors,
    };
    addToCart(itemToAdd);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart("hide"), 1500);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="corporate-gift-detail">
      <img
        src={selectedItem.imageUrl}
        alt={selectedItem.title}
        className="corporate-gift-image"
      />
      <h2 className="corporate-gift-title">{selectedItem.title}</h2>
      <p className="corporate-gift-description">{selectedItem.description}</p>
      <p className="corporate-gift-size">{selectedItem.size}</p>
      <p className="availability-note">
        Wooden board may vary based on availability
      </p>
      {selectedItem?.warning && (
        <p className="gift-package-warning">{selectedItem?.warning}</p>
      )}
      <div className="corporate-gift-price">
        {currency === "Dollar"
          ? `$${selectedItem.priceDollar}`
          : `₪${selectedItem.priceShekel}`}
      </div>
      <div className="quantity-selector">
        <label htmlFor="quantity">Quantity:</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
          step="1"
          className="quantity-input"
        />
        {(quantity < 5 || isNaN(quantity)) && quantity !== "" && (
          <p className="error-message">Minimum order quantity is 5.</p>
        )}
      </div>
      {selectedItem.title === "Mini Four Collection Board" && (
        <div className="flavor-selection">
          {selectedFlavors.map((flavor, index) => (
            <div key={index} className="honey-flavor-dropdown">
              <label htmlFor={`flavor-${index}`}>
                Honey Flavor {index + 1}:
              </label>
              <select
                id={`flavor-${index}`}
                value={flavor}
                onChange={(e) => handleFlavorChange(index, e.target.value)}
              >
                {selectedItem.availableFlavors.map((flavorOption) => (
                  <option key={flavorOption} value={flavorOption}>
                    {flavorOption}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      {selectedItem.hasLogoOption && (
        <div className="logo-option">
          {/* <label>
            <input
              type="checkbox"
              checked={includeLogo}
              onChange={handleLogoChange}
            />
            Add Personalized Logo (+$50)
          </label> */}
          {includeLogo && (
            <div className="upload-artwork">
              <label htmlFor="artwork">Upload Artwork:</label>
              <input
                type="file"
                id="artwork"
                accept="image/*"
                onChange={handleArtworkUpload}
              />
              {uploadError && <p className="error">{uploadError}</p>}
              {uploading && (
                <p className="loading">Uploading... Please wait.</p>
              )}
              {artwork && artwork.previewURL && (
                <p className="uploaded-file">
                  <a
                    href={artwork.previewURL}
                    download={artwork.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {artwork.name}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      )}
      {addedToCart ? (
        <div
          className={`notification ${addedToCart === "hide" ? "hide" : "show"}`}
        >
          <FaCheckCircle className="checkmark" />
          Added to cart
        </div>
      ) : (
        <button
          onClick={!selectedItem.isSoldOut && handleAddToCart}
          className="add-to-cart-btn"
          title={
            shopRegion !== "Israel"
              ? "This item is only available in Israel."
              : selectedItem.isSoldOut
              ? "This item is sold out."
              : ""
          }
          disabled={
            uploading ||
            (includeLogo && !artwork?.previewURL) ||
            quantity < 5 ||
            isNaN(quantity) ||
            quantity === "" ||
            shopRegion !== "Israel" ||
            selectedItem.isSoldOut
          } // Disable button while uploading or if artwork is required but not available
        >
          {selectedItem.isSoldOut ? "Sold Out" : "Add to Cart"}
        </button>
      )}
    </div>
  );
}

export default CorporateGiftDetail;
