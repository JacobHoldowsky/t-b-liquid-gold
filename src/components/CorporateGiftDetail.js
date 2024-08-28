import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";
import "./CorporateGiftDetail.css";

function CorporateGiftDetail({ cart, addToCart }) {
  const { corporateId } = useParams();
  const { currency } = useContext(CurrencyContext);
  const exchangeRate = useContext(ExchangeRateContext);

  const items = {
    miniCollectionBoard: {
      title: "Mini Collection Board",
      description:
        "Gift your employees with 6 of our mini 2oz flavored creamed honey jars on a wooden board. Option to add your personalized logo to these jars. Flavors included on this board: Cinnamon, Vanilla, Chocolate, Sea Salt, Pumpkin, Bourbon.",
      priceDollar: 50,
      priceShekel: exchangeRate
        ? Math.ceil(50 * exchangeRate)
        : Math.ceil(50 * 3.7),
      imageUrl: "/miniCollectionBoard.jpeg",
      hasLogoOption: true,
    },
    deluxeBox: {
      title: "Deluxe Box",
      description: "A deluxe box featuring a selection of premium items.",
      priceDollar: 120,
      priceShekel: 400,
      imageUrl: "/Deluxe Box $120.jpg",
      hasLogoOption: false,
    },
    belgianBox: {
      title: "Belgian Box",
      description: "A Belgian box containing premium chocolates.",
      priceDollar: 100,
      priceShekel: 350,
      imageUrl: "/Belgian Box $100.jpg",
      hasLogoOption: false,
    },
    forHim: {
      title: "For Him",
      description: "A gift package specially curated for him.",
      priceDollar: 55,
      priceShekel: 200,
      imageUrl: "/For Him $55.jpg",
      hasLogoOption: false,
    },
    forHer: {
      title: "For Her",
      description: "A gift package specially curated for her.",
      priceDollar: 55,
      priceShekel: 200,
      imageUrl: "/For Her $55.jpg",
      hasLogoOption: false,
    },
  };

  const selectedItem = items[corporateId];
  const [quantity, setQuantity] = useState(15);
  const [addedToCart, setAddedToCart] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [artwork, setArtwork] = useState(null);

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleLogoChange = (e) => {
    setIncludeLogo(e.target.checked);
  };

  const handleArtworkUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
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
          console.error("Upload failed:", data.message);
        }
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...selectedItem,
      priceDollar: selectedItem.priceDollar,
      priceShekel: selectedItem.priceShekel,
      quantity,
      includeLogo,
      artwork,
      logoCharge: includeLogo ? 50 : 0,
      logoUrl: includeLogo && artwork ? artwork.previewURL : null, // Ensure this is added
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
      <div className="corporate-gift-price">
        {currency === "Dollar"
          ? `$${selectedItem.priceDollar}`
          : `₪${selectedItem.priceShekel}`}
      </div>
      <div className="quantity-selector">
        <label htmlFor="quantity">Quantity:</label>
        <select
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
          className="select-dropdown"
        >
          {[...Array(86).keys()].map((num) => (
            <option key={num + 15} value={num + 15}>
              {num + 15}
            </option>
          ))}
        </select>
      </div>
      {selectedItem.hasLogoOption && (
        <div className="logo-option">
          <label>
            <input
              type="checkbox"
              checked={includeLogo}
              onChange={handleLogoChange}
            />
            Add Personalized Logo (+$50)
          </label>
          {includeLogo && (
            <div className="upload-artwork">
              <label htmlFor="artwork">Upload Artwork:</label>
              <input
                type="file"
                id="artwork"
                accept="image/*"
                onChange={handleArtworkUpload}
              />
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
        <button onClick={handleAddToCart} className="add-to-cart-btn">
          Add to Cart
        </button>
      )}
    </div>
  );
}

export default CorporateGiftDetail;
