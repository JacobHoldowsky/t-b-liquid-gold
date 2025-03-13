import React, { useState, useContext, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { ExchangeRateContext } from "../context/ExchangeRateContext";
import { FaCheckCircle } from "react-icons/fa";
import "./PurimDetail.css";
import QuantitySelector from "./QuantitySelector";
import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

// Reusable Notification Component
const Notification = ({ addedToCart }) =>
  addedToCart && (
    <div className={`notification ${addedToCart === "hide" ? "hide" : "show"}`}>
      <FaCheckCircle className="checkmark" />
      Added to cart
    </div>
  );

const HechsherModal = ({ isOpen, onClose, hechsherim }) => {
  if (!isOpen) return null;

  return (
    <div className="hechsher-modal-overlay">
      <div className="hechsher-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h3>Hechsherim List</h3>
        <div className="hechsher-list">
          {Object.entries(hechsherim).map(([item, hechsher]) => (
            <div key={item} className="hechsher-item">
              <span className="item-name">{item}:</span>
              <span className="hechsher-name">{hechsher}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendingPopup = ({ side, item, currency, calculatePriceInShekels, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={`trending-popup ${side}`}>
      <div className="trending-content">
        <button
          className="close-trending-btn"
          onClick={onClose}
        >
          ×
        </button>
        <h4>{item.title === "Send a Mishloach Manos to a Soldier Family"
          ? "Send love to our soldier families"
          : "For the kids"}</h4>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="trending-image"
        />
        <h5>{item.title}</h5>
        <p className="trending-price">
          {currency === "Dollar" ? `$${item.priceDollar}` : `₪${calculatePriceInShekels(item.priceDollar)}`}
        </p>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="trending-quantity"
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <button
          onClick={() => onAdd(quantity)}
          className="trending-add-btn"
        >
          Add to my order
        </button>
      </div>
    </div>
  );
};

function PurimDetail({ cart, addToCart }) {
  const { purimId } = useParams();
  const { currency } = useContext(CurrencyContext);
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  const exchangeRate = useContext(ExchangeRateContext);

  // Helper function to calculate price in Shekels
  const calculatePriceInShekels = (priceDollar) =>
    exchangeRate
      ? Math.ceil(priceDollar * exchangeRate)
      : Math.ceil(priceDollar * 3.7);
  // Memoize the items object to prevent unnecessary recalculations
  const items = useMemo(() => {
    const allItems = {
      forHim: {
        title: "For Him",
        description: "2 flavored creamed honeys, moscato, wooden honey dipper.",
        priceDollar: 49,
        priceShekel: calculatePriceInShekels(49),
        imageUrl: "/For Him $55-min.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Flavored Creamed Honey": "Vaad Hakashrus Rabbi Weiner",
          "Moscato": "Badatz Eidah Hachareidus"
        }
      },
      forHer: {
        title: "For Her",
        description: "2 flavored creamed honeys, Rosato, wooden honey dipper",
        priceDollar: 49,
        priceShekel: calculatePriceInShekels(49),
        imageUrl: "/For Her $55-min.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Flavored Creamed Honey": "Vaad Hakashrus Rabbi Weiner",
          "Rosato": "Badatz Eidah Hachareidus"
        }
      },
      teaParty: {
        title: "Tea Party",
        description: "1 Flavored creamed honey, 4 lotus cookies, 5 tea packets, and a wooden honey dipper.",
        priceDollar: 35,
        priceShekel: calculatePriceInShekels(35),
        imageUrl: "/teaParty.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Flavored Creamed Honey": "Vaad Hakashrus Rabbi Weiner",
          "Wissotzky Tea": "Badatz Rav Rubin",
          "Lotus Cookies": "Badatz Chasam Sofer Bnei Brak"
        }
      },
      israelsGold: {
        title: "Israel's Gold",
        description: "2 Flavored creamed honeys, 200ml Blue Nun, Schmerling chocolate (Dairy), and a wooden honey dipper.",
        priceDollar: 70,
        priceShekel: calculatePriceInShekels(70),
        imageUrl: "/israelsGold.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Blue Nun": "OU America",
          "Fruit Jam": "Badatz Chasam Sofer Bnei Bak",
          "Schmerling chocolate": "Badatz Zurich",
          "Flavored Cream honey": "Vaad Hakashrus Rabbi Weiner"
        }
      },
      lchaim: {
        title: "Lchaim Board",
        description: "375ml Bottle of wine and 18 Praline Chocolates (Dairy).",
        priceDollar: 130,
        priceShekel: calculatePriceInShekels(130),
        imageUrl: "/lchaim.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Wine": "Badatz Eidah Hachareidus",
          "Praline Chocolates": "Badatz Eidah Hachareidus"
        }
      },
      whiskeyNChocolates: {
        title: "Whiskey n' Chocolates",
        description: "375ml Jack Daniels and 12 Praline chocolates (Dairy).",
        priceDollar: 105,
        priceShekel: calculatePriceInShekels(105),
        imageUrl: "/whiskeyNChocolates.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Jack Daniels": "Kosher",
          "Praline Chocolates": "Badatz Eidah Hachareidus"
        }
      },
      HoneyALaConnoisseur: {
        title: "Honey A' La Connoisseur",
        description:
          "2 Flavored creamed honeys, 375ml bottle of wine, 5 Dairy Belgian chocolates, wooden honey dipper.",
        warning: "*Wine bottle will vary based on availability",
        priceDollar: 80,
        priceShekel: calculatePriceInShekels(80),
        honeyCount: 2,
        imageUrl: "/honeyALaConnoisseur.jpg",
        category: "gift packages",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Flavored creamed honey": "Vaad Hakashrus Rabbi Weiner",
          "Wine": "Badatz Eidah Hachareidus"
        }
      },
      familyFun: {
        title: "Family Fun",
        description: "750ml bottle of wine, Box of Gushers, Twizzlers, Mentos, Mike n' Ikes, 5 Praline chocolates (Dairy), Purim chocolates, and Crackers.",
        priceDollar: 100,
        priceShekel: calculatePriceInShekels(100),
        imageUrl: "/familyFun.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Wine": "Badatz Eidah Hachareidus",
          "Praline Chocolate": "Badatz Eidah Hachareidus",
          "Twizzlers": "OU America",
          "Mentos": "Badatz Chasam Sofer Bnei Brak",
          "Purim chocolate": "Rav Landau/Rav Westheim",
          "Mike n' Ikes": "OU America",
          "Gushers": "OU America",
          "Yummy Earth Lollipops": "Kof-K"
        }
      },
      scotchNPop: {
        title: "Scotch n' Pop",
        description: "750ml Glenlivet, 2 Bags flavored popcorn, and 12 Praline chocolates (Dairy).",
        priceDollar: 165,
        priceShekel: calculatePriceInShekels(165),
        imageUrl: "/scotchAndPop.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Glenlivet": "Kosher",
          "Praline Chocolates": "Badatz Eidah Hachareidus",
          "Popcorn": "OU America"
        }
      },
      kidsSpecial: {
        title: "Kids Special",
        description: "Chip bag, oodles, fruit nuggets, lolly fizz, candy spinner, and chocolate bar (Dairy).",
        priceDollar: 10,
        priceShekel: calculatePriceInShekels(10),
        imageUrl: "/kidsSpecialBack.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Snack Bag": "Badatz Eidah Hachareidus",
          "Oodles": "Badatz Eidah Hachareidus",
          "Chocolate": "Badatz Manchester",
          "Candy Spinner": "Badatz Igud Rabbanim",
          "Fizz Lolly": "Badatz Manchester",
          "Fruit Nuggets": "Badatz Igud Rabbanim"
        }
      },
      noshBox: {
        title: "Nosh Box",
        description: "2 Snack bags, Mike N' Ikes, Gushers, chocolate bar (Dairy), Clicks (Dairy), and Mints/gum.",
        priceDollar: 35,
        priceShekel: calculatePriceInShekels(35),
        imageUrl: "/noshBox.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "2 Snack Bags": "Badatz Eidah Hachareidus",
          "Clicks chocolates": "Badatz Eidah Hachareidus",
          "Mike N' Ikes": "OU America",
          "Gushers": "OU America",
          "Bazooka": "Badatz Igud Rabbanim"
        }
      },
      jerkyBox: {
        title: "Jerky Box",
        description: "Beef Jerky, Oreos, Coke, Pringles, Mike n' Ikes, and Snacks bag.",
        priceDollar: 55,
        priceShekel: calculatePriceInShekels(55),
        imageUrl: "/bochurBox.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Beef Jerky": "Rabbi Akiva Dershowitz",
          "Oreo Cookies": "Badatz Igud Rabbanim",
          "Coke": "Badatz Rav Rubin",
          "Mike n' Ikes": "OU America",
          "Pringles": "OU America",
          "Snacks": "Badatz Eidah Hachareidus"
        }
      },
      signatureBoard: {
        title: "Signature Board",
        description: "Olive oil, 1 flavored creamed honey, and 4 tea bags",
        priceDollar: 60,
        priceShekel: calculatePriceInShekels(60),
        imageUrl: "/signatureBoard.jpg",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Olive Oil": "OK",
          "Flavored Creamed Honey": "Vaad Hakashrus Rabbi Weiner",
          "Wissotzky Tea": "Badatz Rav Rubin"
        }
      },
      soldierFamilySpecial: {
        title: "Send a Mishloach Manos to a Soldier Family",
        description: "Since October 7, 2023 we have been through very challenging times in Israel. Many women are alone for many months while their husbands are fighting the war. We invite you to partner with us and send love and support to our milluim families in Israel. We created a special mishloach manos for these families so that you can bring them joy and happiness. Please consider sponsoring a mishloach manos, and we will distribute it to the families on your behalf. Thank you for helping us spread happiness and love to the ones who need it most.",
        priceDollar: 25,
        priceShekel: calculatePriceInShekels(25),
        imageUrl: "/soldierFamilySpecial.png",
        flagImageUrl: "/israeliFlag.webp",
        category: "purim",
        availableInRegions: ["Israel"],
        hechsherim: {
          "Assorted Items": "Various Kosher Certifications"
        }
      },
    };

    return allItems; // Return all items if not in the US region
  }, [exchangeRate, shopRegion]);

  const selectedItem = items[purimId];

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showKidsPopup, setShowKidsPopup] = useState(true);
  const [showSoldierPopup, setShowSoldierPopup] = useState(true);
  const [isHechsherModalOpen, setIsHechsherModalOpen] = useState(false);

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...selectedItem,
      quantity,
    };

    addToCart(itemToAdd);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart("hide"), 1500);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleTrendingAdd = (itemId, quantity) => {
    const itemToAdd = items[itemId];
    addToCart({
      ...itemToAdd,
      quantity
    });
    setQuantity(1);
  };

  // Determine if the item is available in the current region
  const isAvailableInRegion =
    selectedItem?.availableInRegions.includes(shopRegion);

  return (
    <div className="purim-detail">
      {selectedItem?.flagImageUrl && (
        <img
          src={selectedItem.flagImageUrl}
          alt="Israeli Flag"
          className="israel-flag"
        />
      )}
      <img
        src={selectedItem?.imageUrl}
        alt={selectedItem?.title}
        className="purim-image"
      />
      <h2 className="purim-title">{selectedItem?.title}</h2>
      <p className="purim-description">{selectedItem?.description}</p>
      {selectedItem?.warning && (
        <p className="purim-warning">{selectedItem?.warning}</p>
      )}
      <button
        className="view-hechsher-btn"
        onClick={() => setIsHechsherModalOpen(true)}
      >
        Click here to view a list of hechsherim
      </button>
      <div className="purim-price">
        {currency === "Dollar"
          ? `$${selectedItem?.priceDollar}`
          : `₪${selectedItem?.priceShekel}`}
      </div>
      <QuantitySelector
        quantity={quantity}
        handleQuantityChange={handleQuantityChange}
      />

      <Notification addedToCart={addedToCart} />
      {!addedToCart && (
        <button
          onClick={!selectedItem.isSoldOut && handleAddToCart}
          className="add-to-cart-btn"
          disabled={!isAvailableInRegion || selectedItem.isSoldOut}
          title={
            !isAvailableInRegion
              ? "This item is only available in Israel"
              : selectedItem.isSoldOut
                ? "This item is sold out."
                : ""
          }
        >
          {selectedItem.isSoldOut ? "Sold Out" : "Add to Cart"}
        </button>
      )}

      {/* Change popup logic to show opposite popups */}
      {purimId === 'kidsSpecial' && (
        <TrendingPopup
          side="right"
          item={items.soldierFamilySpecial}
          currency={currency}
          calculatePriceInShekels={calculatePriceInShekels}
          onClose={() => setShowSoldierPopup(false)}
          onAdd={(qty) => handleTrendingAdd('soldierFamilySpecial', qty)}
        />
      )}
      {purimId === 'soldierFamilySpecial' && (
        <TrendingPopup
          side="left"
          item={items.kidsSpecial}
          currency={currency}
          calculatePriceInShekels={calculatePriceInShekels}
          onClose={() => setShowKidsPopup(false)}
          onAdd={(qty) => handleTrendingAdd('kidsSpecial', qty)}
        />
      )}
      {purimId !== 'kidsSpecial' && purimId !== 'soldierFamilySpecial' && (
        <>
          {showKidsPopup && (
            <TrendingPopup
              side="left"
              item={items.kidsSpecial}
              currency={currency}
              calculatePriceInShekels={calculatePriceInShekels}
              onClose={() => setShowKidsPopup(false)}
              onAdd={(qty) => handleTrendingAdd('kidsSpecial', qty)}
            />
          )}
          {showSoldierPopup && (
            <TrendingPopup
              side="right"
              item={items.soldierFamilySpecial}
              currency={currency}
              calculatePriceInShekels={calculatePriceInShekels}
              onClose={() => setShowSoldierPopup(false)}
              onAdd={(qty) => handleTrendingAdd('soldierFamilySpecial', qty)}
            />
          )}
        </>
      )}

      <HechsherModal
        isOpen={isHechsherModalOpen}
        onClose={() => setIsHechsherModalOpen(false)}
        hechsherim={selectedItem?.hechsherim || {}}
      />
    </div>
  );
}

export default PurimDetail;
