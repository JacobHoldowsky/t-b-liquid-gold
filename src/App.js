import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import About from "./components/About";
import Contact from "./components/Contact";
import Checkout from "./components/Checkout";
import Success from "./components/Success";
import Canceled from "./components/Canceled";
import HeroSection from "./components/HeroSection";
import FeaturedProducts from "./components/FeaturedProducts";
import AboutSection from "./components/AboutSection";
import TestimonialsSection from "./components/TestimonialsSection";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop"; // Import the ScrollToTop component
import { v4 as uuidv4 } from "uuid";
import Catalog from "./components/Catalog";

function App() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.title === item.title
    );
    let updatedCart;

    if (existingItemIndex !== -1) {
      updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
    } else {
      const itemWithId = { ...item, id: uuidv4(), quantity: 1 };
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

  const calculateCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Header cartItemCount={calculateCartItemCount()} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <FeaturedProducts />
                <AboutSection />
                <TestimonialsSection />
              </>
            }
          />
          <Route
            path="/catalog"
            element={<Catalog cart={cart} addToCart={addToCart} />}
          />
          <Route
            path="/giftPackages"
            element={<Catalog cart={cart} addToCart={addToCart} />}
          />
          <Route
            path="/corporateGifts"
            element={<Catalog cart={cart} addToCart={addToCart} />}
          />
          <Route
            path="/wholesale"
            element={<Catalog cart={cart} addToCart={addToCart} />}
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
              />
            }
          />
          <Route path="/success" element={<Success />} />
          <Route path="/canceled" element={<Canceled />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
