// src/components/Modal.js
import React from "react";
import "./Modal.css"; // Modal-specific styles

function Modal({ isOpen, title, message, onConfirm, onCancel, noOptions }) {
  if (!isOpen) return null; // Render nothing if modal is not open

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h2 className="confirmation-modal-title">{title}</h2>
        <p className="confirmation-modal-message">{message}</p>
        {!noOptions ? (
          <div className="confirmation-modal-buttons">
            <button
              className="confirmation-modal-button confirm"
              onClick={onConfirm}
            >
              Yes
            </button>
            <button
              className="confirmation-modal-button cancel"
              onClick={onCancel}
            >
              No
            </button>
          </div>
        ) : (
          <div className="confirmation-modal-buttons">
            <button
              className="confirmation-modal-button confirm"
              onClick={onConfirm}
            >
              Ok
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
