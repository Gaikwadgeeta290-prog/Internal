
import { useState } from "react";
import { Phone, X, Copy, Mail } from "lucide-react";

export default function CallDetailsPopup({ onClose }) {
  const [copied, setCopied] = useState(false);

  const phone = "+919307898468";

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="lead-overlay" onMouseDown={onClose}>
      <section
        className="lead-modal call-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-details-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="lead-close"
          type="button"
          onClick={onClose}
          aria-label="Close contact details"
        >
          <X size={21} />
        </button>

        <div className="lead-content">
          <p className="lead-eyebrow">ATELIER NOIRE</p>
          <h2 id="call-details-title">Let’s Talk About Your Space</h2>
          <p className="lead-description">
            Connect with our studio team to discuss your interior design project.
          </p>

          <div className="call-detail-row">
            <Phone size={20} />
            <div>
              <strong>Call our studio</strong>
              <p>{phone}</p>
            </div>
          </div>

          <div className="call-detail-actions">
            <a className="lead-submit" href="tel:+919307898468" aria-label="Call Atelier Noire at +91 93078 98468">
              <Phone size={16} /> Call Now
            </a>

            <button
              className="lead-submit"
              type="button"
              onClick={copyPhone}
            >
              <Copy size={16} /> {copied ? "Copied" : "Copy Number"}
            </button>
          </div>

          <div className="call-detail-row">
            <Mail size={20} />
            <div>
              <strong>Email our studio</strong>
              <p>Use the studio's verified email address here.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
