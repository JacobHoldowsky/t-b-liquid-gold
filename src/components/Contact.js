import React, { useState } from "react";
import "./Contact.css";
import { useShopContext } from "../context/ShopContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    message: "",
    website: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const { shopRegion } = useShopContext();

  const whatsappUrl =
    shopRegion === "US"
      ? "https://wa.me/message/AUHFRK2KKV27O1"
      : "https://wa.me/+972534309254";

  const phoneNumber = shopRegion === "US" ? "845-269-8649" : "053-430-9254";
  const phoneUrl = `tel:${phoneNumber.replace(/-/g, "")}`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const apiUrl = "/api/send-email"; // This will work in both development and production

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, shopRegion }),
      });

      if (response.ok) {
        toast.success("Message sent successfully!"); // Success notification
        setFormData({
          name: "",
          email: "",
          number: "",
          message: "",
          website: "",
        });
      } else {
        toast.error("Failed to send message. Please try again."); // Error notification
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message. Please try again."); // Error notification
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-info">
        <h2>Contact Us</h2>
        <div className="info">
          <p>
            We would love to hear from you. Reach out to us on{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            .
          </p>
          <p>
            Call us directly at: <a href={phoneUrl}>{phoneNumber}</a>
          </p>
          <p>We look forward to connecting with you.</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send Us a Message</h3>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            autoComplete="off"
            tabIndex="-1"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-10000px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
          />
          <input
            type="tel"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="Your Phone Number"
            required
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            required
          />
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? (
              <>
                <span style={{ marginRight: "10px" }}>Sending...</span>{" "}
                <div className="loader"></div> {/* Spinner */}
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
      <ToastContainer /> {/* Toast notification container */}
    </div>
  );
}

export default Contact;
