
import { useState } from "react";
import "./LeadCapturePopup.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function LeadCapturePopup({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    pincode: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/popup-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit your enquiry.");
      }

      setMessage("Thank you! Our studio team will contact you shortly.");
      setForm({ name: "", mobile: "", pincode: "" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lead-overlay" onMouseDown={onClose}>
      <section
        className="lead-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="lead-close"
          aria-label="Close enquiry form"
          onClick={onClose}
        >
          ×
        </button>

        <div className="lead-banner">
          <span>ATELIER NOIRE</span>
          <p>Thoughtfully designed. Beautifully lived.</p>
        </div>

        <div className="lead-content">
          <p className="lead-eyebrow">YOUR SPACE, YOUR STORY</p>
          <h2 id="lead-title">Let’s Create Your Dream Space</h2>
          <p className="lead-description">
            Share your details and our studio team will get in touch.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="lead-name">Full name</label>
            <input
              id="lead-name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Enter your name"
              autoComplete="name"
              maxLength={100}
              required
            />

            <label htmlFor="lead-mobile">Mobile number</label>
            <input
              id="lead-mobile"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={updateField}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              title="Enter a valid 10-digit Indian mobile number"
              required
            />

            <label htmlFor="lead-pincode">Pincode</label>
            <input
              id="lead-pincode"
              name="pincode"
              value={form.pincode}
              onChange={updateField}
              placeholder="Enter your 6-digit pincode"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />

            {error && <p className="lead-error">{error}</p>}
            {message && <p className="lead-success">{message}</p>}

            <button className="lead-submit" type="submit" disabled={busy}>
              {busy ? "Submitting..." : "Request a Consultation"}
            </button>
          </form>

          <p className="lead-privacy">
            By submitting, you agree that our studio may contact you about
            your interior design enquiry.
          </p>
        </div>
      </section>
    </div>
  );
}
