import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import About from "./components/About";
import Contact from "./components/Contact";
import Checkout from "./components/Checkout";
import Success from "./components/Success";
import SponsorAHoneyBoard from "./components/SponsorAHoneyBoard";
import Canceled from "./components/Canceled";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { v4 as uuidv4 } from "uuid";
import LandingPage from "./components/LandingPage";
import HoneyCollection from "./components/HoneyCollection";
import GiftPackages from "./components/GiftPackages";
import GiftPackageDetail from "./components/GiftPackageDetail";
import CorporateGifts from "./components/CorporateGifts";
import USDistributors from "./components/USDistributors";
import IsraelDistributors from "./components/IsraelDistributors";
import Wholesale from "./components/Wholesale";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ExchangeRateProvider } from "./context/ExchangeRateContext"; // Import the new context
import "./index.css";
import CorporateGiftDetail from "./components/CorporateGiftDetail";
import { ShopProvider } from "./context/ShopContext";

function App() {
  const [cart, setCart] = useState([]);
  const [specialDeliveryFee, setSpecialDeliveryFee] = useState(0); // New state for the special delivery fee

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item) => {
    // Find if an item with the same title and selected flavors already exists in the cart
    const existingItemIndex = cart.findIndex(
      (cartItem) =>
        cartItem.title === item.title &&
        JSON.stringify(cartItem.selectedFlavors) ===
          JSON.stringify(item.selectedFlavors)
    );

    let updatedCart;

    if (existingItemIndex !== -1) {
      // If the item exists, update its quantity
      updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += item.quantity; // Add the selected quantity
    } else {
      // If it doesn't exist, add a new item to the cart with a unique ID
      const itemWithId = { ...item, id: uuidv4() };
      updatedCart = [...cart, itemWithId];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (id) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          if (item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            return null;
          }
        }
        return item;
      })
      .filter((item) => item !== null);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const calculateCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CurrencyProvider>
      <ShopProvider>
        <ExchangeRateProvider>
          {" "}
          {/* Wrap with ExchangeRateProvider */}
          <Router>
            <ScrollToTop />
            <div className="App">
              <Header
                cartItemCount={calculateCartItemCount()}
                clearCart={clearCart}
              />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/honeyCollection"
                  element={
                    <HoneyCollection cart={cart} addToCart={addToCart} />
                  }
                />
                <Route
                  path="/giftPackages"
                  element={<GiftPackages cart={cart} addToCart={addToCart} />}
                />
                <Route
                  path="/giftPackages/:packageId"
                  element={
                    <GiftPackageDetail cart={cart} addToCart={addToCart} />
                  }
                />
                <Route
                  path="/corporateGifts"
                  element={<CorporateGifts cart={cart} addToCart={addToCart} />}
                />
                <Route
                  path="/corporateGifts/:corporateId"
                  element={
                    <CorporateGiftDetail cart={cart} addToCart={addToCart} />
                  }
                />
                <Route
                  path="/distributors/us"
                  element={<USDistributors cart={cart} addToCart={addToCart} />}
                />
                <Route
                  path="/distributors/israel"
                  element={
                    <IsraelDistributors cart={cart} addToCart={addToCart} />
                  }
                />

                <Route
                  path="/wholesale"
                  element={<Wholesale cart={cart} addToCart={addToCart} />}
                />
                <Route
                  path="/sponsorAHoneyBoard"
                  element={
                    <SponsorAHoneyBoard
                      cart={cart}
                      addToCart={addToCart}
                      setDeliveryFee={setSpecialDeliveryFee}
                    />
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/checkout"
                  element={
                    <Checkout
                      cart={cart}
                      removeFromCart={removeFromCart}
                      setCart={setCart}
                      specialDeliveryFee={specialDeliveryFee}
                    />
                  }
                />
                <Route
                  path="/success"
                  element={<Success setCart={setCart} />}
                />
                <Route path="/canceled" element={<Canceled />} />
              </Routes>
              <Footer />
              <FloatingWhatsAppButton />
            </div>
          </Router>
        </ExchangeRateProvider>
      </ShopProvider>
    </CurrencyProvider>
  );
}

export default App;
