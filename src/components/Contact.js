import React, { useState } from "react";
import "./Contact.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const apiUrl = '/api/send-email';  // This will work in both development and production

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent successfully!"); // Success notification
        setFormData({
          name: "",
          email: "",
          number: "",
          message: "",
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
              href="https://wa.me/message/W7IN5L774FZJJ1"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            .
          </p>
          <p>
            Call us directly at: <a href="tel:0534309254">0534309254</a>
          </p>
          <p>We look forward to connecting with you.</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send Us a Message</h3>
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
