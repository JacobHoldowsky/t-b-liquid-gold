import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import moment from "moment-timezone"; // Import moment-timezone for timezone support
import SunCalc from "suncalc"; // Import SunCalc for solar time calculations
import Header from "./components/Header";
import About from "./components/About";
import Contact from "./components/Contact";
import Checkout from "./components/Checkout";
import Success from "./components/Success";
import SponsorAHoneyBoard from "./components/SponsorAHoneyBoard";
import SponsorAHoneyBoardDetail from "./components/SponsorAHoneyBoardDetail";
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
import { ExchangeRateProvider } from "./context/ExchangeRateContext";
import "./index.css";
import CorporateGiftDetail from "./components/CorporateGiftDetail";
import { ShopProvider } from "./context/ShopContext";

function App() {
  const [cart, setCart] = useState([]);
  const [specialDeliveryFee, setSpecialDeliveryFee] = useState(0); // New state for the special delivery fee
  const [isShabbos, setIsShabbos] = useState(false); // New state for Shabbos
  const timeoutIdRef = useRef(null); // Reference to store the timeout ID

  useEffect(() => {
    const scheduleNextUpdate = () => {
      const now = moment.tz("Asia/Jerusalem");
      const day = now.day(); // 0 (Sunday) to 6 (Saturday)
      const latitude = 31.7683;
      const longitude = 35.2137;

      let nextUpdateInMs;

      if (day === 5 || day === 6) {
        // Get sunset time for the current day
        const date = now.toDate();
        const times = SunCalc.getTimes(date, latitude, longitude);
        const sunsetTimeJerusalem = moment.tz(times.sunset, "Asia/Jerusalem");

        if (day === 5) {
          // Friday
          const shabbosStart = sunsetTimeJerusalem
            .clone()
            .subtract(40, "minutes");

          if (now.isBefore(shabbosStart)) {
            setIsShabbos(false);
            nextUpdateInMs = shabbosStart.diff(now);
          } else {
            setIsShabbos(true);
            // Calculate shabbosEnd for Saturday
            const tomorrow = now.clone().add(1, "day");
            const timesTomorrow = SunCalc.getTimes(
              tomorrow.toDate(),
              latitude,
              longitude
            );
            const sunsetTomorrowJerusalem = moment.tz(
              timesTomorrow.sunset,
              "Asia/Jerusalem"
            );
            const shabbosEnd = sunsetTomorrowJerusalem
              .clone()
              .add(50, "minutes");
            nextUpdateInMs = shabbosEnd.diff(now);
          }
        } else if (day === 6) {
          // Saturday
          const shabbosEnd = sunsetTimeJerusalem.clone().add(50, "minutes");

          if (now.isBefore(shabbosEnd)) {
            setIsShabbos(true);
            nextUpdateInMs = shabbosEnd.diff(now);
          } else {
            setIsShabbos(false);
            // Schedule for next Friday
            const nextFriday = now
              .clone()
              .add((7 - day + 5) % 7, "days")
              .startOf("day");
            nextUpdateInMs = nextFriday.diff(now);
          }
        }
      } else {
        // Other days
        setIsShabbos(false);
        // Schedule for next Friday
        const daysUntilFriday = (5 + 7 - day) % 7 || 7; // Ensure it's at least 1 day ahead
        const nextFriday = now
          .clone()
          .add(daysUntilFriday, "days")
          .startOf("day");
        nextUpdateInMs = nextFriday.diff(now);
      }

      // Ensure nextUpdateInMs is positive
      if (nextUpdateInMs <= 0) {
        // Recalculate immediately if the time has already passed
        scheduleNextUpdate();
        return;
      }

      // Schedule the next update
      timeoutIdRef.current = setTimeout(scheduleNextUpdate, nextUpdateInMs);
    };

    scheduleNextUpdate();

    // Cleanup function to clear any scheduled timeouts if the component unmounts
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

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

            {isShabbos ? (
              <div className="shabbos-overlay">
                <div className="shabbos-closed">
                  <img
                    src="/shabbos.webp"
                    alt="Shabbat Candles and Wine"
                    className="shabbos-image"
                  />
                  <h2>We're currently closed for Shabbos.</h2>
                  <p>We will reopen after Shabbos ends in Jerusalem.</p>
                </div>
              </div>
            ) : (
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
                    path="/sponsorAHoneyBoard"
                    element={
                      <SponsorAHoneyBoard
                        cart={cart}
                        addToCart={addToCart}
                        setDeliveryFee={setSpecialDeliveryFee}
                      />
                    }
                  />
                  <Route
                    path="/sponsorAHoneyBoard/:sponsorAHoneyBoardId"
                    element={
                      <SponsorAHoneyBoardDetail
                        cart={cart}
                        addToCart={addToCart}
                        setDeliveryFee={setSpecialDeliveryFee}
                      />
                    }
                  />
                  <Route
                    path="/corporateGifts"
                    element={
                      <CorporateGifts cart={cart} addToCart={addToCart} />
                    }
                  />
                  <Route
                    path="/corporateGifts/:corporateId"
                    element={
                      <CorporateGiftDetail cart={cart} addToCart={addToCart} />
                    }
                  />
                  <Route
                    path="/distributors/us"
                    element={
                      <USDistributors cart={cart} addToCart={addToCart} />
                    }
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
            )}
          </Router>
        </ExchangeRateProvider>
      </ShopProvider>
    </CurrencyProvider>
  );
}

export default App;
