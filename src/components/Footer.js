import React, { useState } from "react";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  const [testMessage, setTestMessage] = useState("");
  const [testingDeployment, setTestingDeployment] = useState(false);

  const testVercelDeployment = async () => {
    setTestingDeployment(true);
    setTestMessage("");

    try {
      const response = await fetch("/api/test1");
      const message = await response.text();

      if (!response.ok || message.trim() !== "hi jj this is working") {
        throw new Error("The Vercel test function is not serving this page.");
      }

      setTestMessage(message);
    } catch (error) {
      setTestMessage(error.message);
    } finally {
      setTestingDeployment(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} T&B Liquid Gold. All rights reserved.</p>
        <button
          type="button"
          onClick={testVercelDeployment}
          disabled={testingDeployment}
          style={{ marginTop: "12px", padding: "6px 10px", cursor: "pointer" }}
        >
          {testingDeployment ? "Testing deployment..." : "Test Vercel deployment"}
        </button>
        {testMessage && <p role="status">{testMessage}</p>}
        <p className="holdowsky">
          Website created and maintained by{" "}
          <a
            href="https://uxilitypro.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="logo-img"
              src={`${process.env.PUBLIC_URL}/UXilityPROLogoBest.svg`}
              alt="UXilityPRO Logo"
            />
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
