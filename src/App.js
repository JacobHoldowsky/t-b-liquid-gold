import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Catalog from "./components/Catalog";
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

function App() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart from localStorage when the app initializes
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item) => {
    const itemWithId = { ...item, id: uuidv4() }; // Add a unique ID
    const updatedCart = [...cart, itemWithId];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Header cartItemCount={cart.length} />
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
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                removeFromCart={removeFromCart}
                setCart={setCart} // Pass setCart here
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
