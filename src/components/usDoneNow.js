import { useEffect, useRef, useState } from "react";
import "./usDoneNow.css";

export default function UsDoneNow() {
  const MESSAGE = "We are out of stock for U.S. deliveries.";
  const [open, setOpen] = useState(true); // show every time

  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocused = useRef(null);

  // Lock scroll & key handling when open
  useEffect(() => {
    if (!open) return;

    // Lock background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus management
    lastFocused.current = document.activeElement || null;
    if (closeBtnRef.current) closeBtnRef.current.focus();

    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Tab") {
        const container = dialogRef.current;
        if (!container) return;
        const focusables = container.querySelectorAll(
          'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    if (lastFocused.current && lastFocused.current.focus) {
      lastFocused.current.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="usdn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="usdonenow-title"
    >
      <div className="usdn-backdrop" onClick={handleClose} aria-hidden="true" />
      <div ref={dialogRef} className="usdn-dialog" role="document">
        <div className="usdn-header">
          <h2 id="usdonenow-title" className="usdn-title">
            Heads up
          </h2>
          <button
            ref={closeBtnRef}
            onClick={handleClose}
            aria-label="Close"
            className="usdn-close"
          >
            ✕
          </button>
        </div>

        <p className="usdn-message">{MESSAGE}</p>

        <button onClick={handleClose} className="usdn-cta">
          Okay
        </button>
      </div>
    </div>
  );
}
